from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_squared_error, mean_absolute_error, r2_score
)
import io
import json
import os
import joblib
import time
from datetime import datetime
from typing import Any, Dict, List, Optional
import mysql.connector
from mysql.connector import Error as MySQLError
from collections import defaultdict
import psutil

# Classification algorithms
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier

# Regression algorithms
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor

app = Flask(__name__)
CORS(app)

# ---- MySQL helpers ----

def get_db_connection():
    """Create a MySQL connection using environment variables. Returns None on failure."""
    try:
        conn = mysql.connector.connect(
            host=os.environ.get("MYSQL_HOST", "localhost"),
            port=int(os.environ.get("MYSQL_PORT", "3306")),
            user=os.environ.get("MYSQL_USER", "root"),
            password=os.environ.get("MYSQL_PASSWORD", ""),
            database=os.environ.get("MYSQL_DB", "mlops"),
            autocommit=True,
        )
        return conn
    except MySQLError as e:
        print("MySQL connection failed:", str(e))
        return None

def ensure_models_table(conn):
    """Create models table if it does not exist."""
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS models (
                id INT AUTO_INCREMENT PRIMARY KEY,
                model_name VARCHAR(255) NOT NULL,
                description TEXT,
                model_type VARCHAR(50),
                input_features TEXT,
                output_feature VARCHAR(255),
                best_algorithm VARCHAR(255),
                justification TEXT,
                model_file VARCHAR(255),
                report_file VARCHAR(255),
                metric_primary FLOAT,
                metrics_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        cursor.close()
    except MySQLError as e:
        print("MySQL table creation failed:", str(e))

    # Best-effort add metrics_json if table already existed without it
    try:
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE models ADD COLUMN metrics_json TEXT")
        cursor.close()
    except MySQLError:
        pass  # column already exists or alter not needed

def ensure_api_usage_table(conn):
    """Create api_usage_events table if it does not exist."""
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS api_usage_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                model_id INT NULL,
                model_file VARCHAR(255),
                event_type ENUM('copy', 'predict') NOT NULL,
                success BOOLEAN DEFAULT TRUE,
                latency_ms FLOAT,
                cpu_percent FLOAT,
                ram_mb FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_model_id (model_id),
                INDEX idx_created_at (created_at)
            );
            """
        )
        cursor.close()
    except MySQLError as e:
        print("MySQL api_usage_events table creation failed:", str(e))

def log_api_event(
    model_id: Optional[int],
    model_file: Optional[str],
    event_type: str,
    success: bool,
    latency_ms: Optional[float] = None,
    cpu_percent: Optional[float] = None,
    ram_mb: Optional[float] = None,
):
    """Persist an API usage event. Best-effort: return silently on DB issues."""
    conn = get_db_connection()
    if conn is None:
        return
    ensure_api_usage_table(conn)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO api_usage_events (model_id, model_file, event_type, success, latency_ms, cpu_percent, ram_mb)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                model_id,
                model_file,
                event_type,
                success,
                latency_ms,
                cpu_percent,
                ram_mb,
            ),
        )
        conn.commit()
        cursor.close()
    except MySQLError as e:
        print("MySQL log api event failed:", str(e))
    finally:
        conn.close()

def get_api_stats(model_id: int):
    """Aggregate API usage for a given model."""
    default_stats = {
        'total_copies': 0,
        'total_predictions': 0,
        'success_predictions': 0,
        'failed_predictions': 0,
        'success_rate': None,
        'avg_latency_ms': None,
        'avg_cpu_percent': None,
        'avg_ram_mb': None,
        'last_used_at': None,
        'recent_events': [],
        'daily_counts': [],
    }
    conn = get_db_connection()
    if conn is None:
        return default_stats
    ensure_api_usage_table(conn)
    stats = default_stats.copy()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT id, model_id, model_file, event_type, success, latency_ms, cpu_percent, ram_mb, created_at
            FROM api_usage_events
            WHERE model_id = %s
            ORDER BY created_at DESC
            LIMIT 200
            """,
            (model_id,),
        )
        rows = cursor.fetchall() or []
        cursor.close()

        total_events = len(rows)
        stats['total_copies'] = sum(1 for r in rows if r.get('event_type') == 'copy')
        stats['total_predictions'] = sum(1 for r in rows if r.get('event_type') == 'predict')
        success_predictions = sum(1 for r in rows if r.get('event_type') == 'predict' and r.get('success'))
        stats['success_predictions'] = success_predictions
        stats['failed_predictions'] = max(stats['total_predictions'] - success_predictions, 0)
        success_events = sum(1 for r in rows if r.get('success'))
        stats['success_rate'] = round(success_events / total_events, 4) if total_events else None

        latencies = [float(r['latency_ms']) for r in rows if r.get('latency_ms') is not None]
        stats['avg_latency_ms'] = round(sum(latencies) / len(latencies), 2) if latencies else None
        cpu_vals = [float(r['cpu_percent']) for r in rows if r.get('cpu_percent') is not None]
        stats['avg_cpu_percent'] = round(sum(cpu_vals) / len(cpu_vals), 2) if cpu_vals else None
        ram_vals = [float(r['ram_mb']) for r in rows if r.get('ram_mb') is not None]
        stats['avg_ram_mb'] = round(sum(ram_vals) / len(ram_vals), 2) if ram_vals else None

        stats['last_used_at'] = rows[0]['created_at'].isoformat() if rows else None
        stats['recent_events'] = [
            {
                'id': r.get('id'),
                'type': r.get('event_type'),
                'success': bool(r.get('success')),
                'latency_ms': r.get('latency_ms'),
                'cpu_percent': r.get('cpu_percent'),
                'ram_mb': r.get('ram_mb'),
                'created_at': r.get('created_at').isoformat() if r.get('created_at') else None,
            }
            for r in rows[:20]
        ]

        # Daily aggregation (last 14 days)
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                SELECT DATE(created_at) as day, COUNT(*) as total
                FROM api_usage_events
                WHERE model_id = %s
                GROUP BY DATE(created_at)
                ORDER BY day DESC
                LIMIT 14
                """,
                (model_id,),
            )
            day_rows = cursor.fetchall() or []
            cursor.close()
            stats['daily_counts'] = [
                {'day': dr['day'].isoformat() if hasattr(dr['day'], 'isoformat') else str(dr['day']), 'total': dr['total']}
                for dr in reversed(day_rows)
            ]
        except MySQLError as e:
            print("MySQL api usage daily aggregation failed:", str(e))
    except MySQLError as e:
        print("MySQL api usage stats failed:", str(e))
    finally:
        conn.close()
    return stats

def insert_model_metadata(
    model_name: str,
    description: str,
    model_type: str,
    input_features: List[str],
    output_feature: str,
    best_algorithm: str,
    justification: str,
    model_file: Optional[str],
    report_file: Optional[str],
    metric_primary: Optional[float] = None,
    metrics_json: Optional[str] = None,
):
    conn = get_db_connection()
    if conn is None:
        return
    ensure_models_table(conn)
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO models
            (model_name, description, model_type, input_features, output_feature, best_algorithm, justification, model_file, report_file, metric_primary, metrics_json)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                model_name,
                description,
                model_type,
                ",".join(input_features) if input_features else "",
                output_feature or "",
                best_algorithm,
                justification,
                model_file or "",
                report_file or "",
                metric_primary if metric_primary is not None else None,
                metrics_json or "",
            ),
        )
        conn.commit()
        cursor.close()
    except MySQLError as e:
        print("MySQL insert failed:", str(e))
    finally:
        conn.close()

def fetch_models():
    conn = get_db_connection()
    if conn is None:
        return []
    ensure_models_table(conn)
    rows = []
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM models ORDER BY created_at DESC")
        rows = cursor.fetchall()
        cursor.close()
    except MySQLError as e:
        print("MySQL fetch models failed:", str(e))
    finally:
        conn.close()
    return rows

def fetch_model_by_id(model_id: int):
    conn = get_db_connection()
    if conn is None:
        return None
    ensure_models_table(conn)
    row = None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM models WHERE id = %s", (model_id,))
        row = cursor.fetchone()
        cursor.close()
    except MySQLError as e:
        print("MySQL fetch model failed:", str(e))
    finally:
        conn.close()
    return row

def fetch_model_by_file(model_file: str):
    conn = get_db_connection()
    if conn is None:
        return None
    ensure_models_table(conn)
    row = None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM models WHERE model_file = %s LIMIT 1", (model_file,))
        row = cursor.fetchone()
        cursor.close()
    except MySQLError as e:
        print("MySQL fetch model by file failed:", str(e))
    finally:
        conn.close()
    return row

def delete_model_and_usage(model_id: int):
    """Delete a model row, related api usage events, and associated files."""
    conn = get_db_connection()
    if conn is None:
        raise RuntimeError("DB connection unavailable")
    ensure_models_table(conn)
    ensure_api_usage_table(conn)
    # Fetch model for file cleanup
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM models WHERE id = %s", (model_id,))
    model_row = cursor.fetchone()
    if not model_row:
        cursor.close()
        conn.close()
        return None
    # Delete usage events first (best effort)
    try:
        cursor.execute("DELETE FROM api_usage_events WHERE model_id = %s", (model_id,))
    except MySQLError as e:
        print("MySQL delete api_usage_events failed:", str(e))
    # Delete model row
    cursor.execute("DELETE FROM models WHERE id = %s", (model_id,))
    conn.commit()
    cursor.close()
    conn.close()

    # Remove artifacts on disk
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    for fname in [model_row.get('model_file'), model_row.get('report_file')]:
        if fname:
            fpath = os.path.join(models_dir, fname)
            try:
                if os.path.exists(fpath):
                    os.remove(fpath)
            except Exception as e:
                print("File delete failed:", fpath, str(e))
    return model_row

def compute_global_stats(models: List[Dict[str, Any]]):
    stats = defaultdict(int)
    precisions = []
    for m in models:
        stats['total'] += 1
        mtype = (m.get('model_type') or '').lower()
        if mtype == 'classification':
            stats['classification'] += 1
        elif mtype == 'regression':
            stats['regression'] += 1
        # try to parse precision from justification if present
        # (for real precision, frontend should store metrics; here best effort)
        try:
            # e.g., "precision (0.9876)" pattern not guaranteed
            pass
        except Exception:
            pass
        try:
            p = m.get('metric_primary')
            if p is not None:
                p = float(p)
                precisions.append(p)
        except Exception:
            continue
    avg_precision = round(sum(precisions) / len(precisions), 4) if precisions else None
    return {
        'total_models': stats['total'],
        'classification_models': stats['classification'],
        'regression_models': stats['regression'],
        'average_precision': avg_precision
    }

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'ML-OPS Backend API', 'status': 'running'})


def robust_read_csv(csv_string: str):
    """Try to read a CSV string with automatic/several common separators.

    Returns a pandas.DataFrame or raises the last exception.
    """
    import pandas as _pd
    import io as _io

    # First try pandas autodetect (engine='python', sep=None)
    try:
        return _pd.read_csv(_io.StringIO(csv_string), sep=None, engine="python")
    except Exception as e_auto:
        last_exc = e_auto
        # Try common separators
        for sep in [';', ',', '\t']:
            try:
                return _pd.read_csv(_io.StringIO(csv_string), sep=sep)
            except Exception as e:
                last_exc = e
        # If all attempts fail, raise the last exception
        raise last_exc

class MLModelTrainer:
    def __init__(self, model_type):
        self.model_type = model_type
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def get_algorithms(self):
        if self.model_type == 'classification':
            return {
                'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
                'Decision Tree': DecisionTreeClassifier(random_state=42),
                'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
                'Gradient Boosting': GradientBoostingClassifier(random_state=42),
                'Support Vector Machine': SVC(random_state=42),
                'Naive Bayes': GaussianNB(),
                'K-Nearest Neighbors': KNeighborsClassifier()
            }
        else:  # regression
            return {
                'Linear Regression': LinearRegression(),
                'Ridge Regression': Ridge(random_state=42),
                'Lasso Regression': Lasso(random_state=42),
                'Decision Tree': DecisionTreeRegressor(random_state=42),
                'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
                'Gradient Boosting': GradientBoostingRegressor(random_state=42),
                'Support Vector Machine': SVR(),
                'K-Nearest Neighbors': KNeighborsRegressor()
            }
    
    def preprocess_data(self, df, input_features, output_feature):
        # Handle missing values
        df = df.dropna()
        
        # Separate features and target
        X = df[input_features].copy()
        y = df[output_feature].copy()
        
        # Encode categorical features
        for col in X.columns:
            if X[col].dtype == 'object':
                self.label_encoders[col] = LabelEncoder()
                X[col] = self.label_encoders[col].fit_transform(X[col])
        
        # Encode target for classification
        if self.model_type == 'classification' and y.dtype == 'object':
            self.label_encoders['target'] = LabelEncoder()
            y = self.label_encoders['target'].fit_transform(y)
        
        return X, y
    
    def evaluate_classification(self, y_true, y_pred):
        return {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
            'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
            'f1_score': f1_score(y_true, y_pred, average='weighted', zero_division=0)
        }

    def compute_classification_score(self, metrics: Dict[str, float]) -> float:
        """Composite score to balance F1 (40%), accuracy (40%), precision (10%) and recall (10%)."""
        return (
            0.4 * float(metrics.get('f1_score', 0.0))
            + 0.4 * float(metrics.get('accuracy', 0.0))
            + 0.1 * float(metrics.get('precision', 0.0))
            + 0.1 * float(metrics.get('recall', 0.0))
        )
    
    def evaluate_regression(self, y_true, y_pred):
        mse = mean_squared_error(y_true, y_pred)
        return {
            'mse': mse,
            'rmse': np.sqrt(mse),
            'mae': mean_absolute_error(y_true, y_pred),
            'r2_score': r2_score(y_true, y_pred)
        }
    
    def train_and_evaluate(self, df, input_features, output_feature):
        X, y = self.preprocess_data(df, input_features, output_feature)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        algorithms = self.get_algorithms()
        results = []
        
        for name, model in algorithms.items():
            try:
                # Train model
                model.fit(X_train_scaled, y_train)
                
                # Predict
                y_pred = model.predict(X_test_scaled)
                
                # Evaluate
                if self.model_type == 'classification':
                    metrics = self.evaluate_classification(y_test, y_pred)
                    score = self.compute_classification_score(metrics)
                    metrics['composite_score'] = score
                else:
                    metrics = self.evaluate_regression(y_test, y_pred)
                    score = metrics['r2_score']  # Primary metric for regression
                
                results.append({
                    'algorithm': name,
                    'metrics': metrics,
                    'score': score
                })
            except Exception as e:
                print(f"Error with {name}: {str(e)}")
                continue
        # If no algorithm produced results, raise a clear error so caller can handle it
        if len(results) == 0:
            raise ValueError(
                "No algorithms could be trained successfully. Check your dataset for sufficient rows, correct column types, and that the selected input/output columns exist and contain valid values."
            )

        # Sort by score and select best
        results.sort(key=lambda x: x['score'], reverse=True)
        best_model = results[0]
        
        # Generate justification
        justification = self.generate_justification(best_model, results, self.model_type)
        
        return {
            'results': results,
            'best_model': best_model['algorithm'],
            'justification': justification
        }
    
    def generate_justification(self, best_model, all_results, model_type):
        algorithm = best_model['algorithm']
        metrics = best_model['metrics']
        score_value = float(best_model.get('score', 0.0))

        # Générer la justification en français
        if model_type == 'classification':
            primary_metric = 'score composite'
            f1_val = metrics.get('f1_score', 0.0)
            acc_val = metrics.get('accuracy', 0.0)
            prec_val = metrics.get('precision', 0.0)
            rec_val = metrics.get('recall', 0.0)
            justification_parts = [
                f"{algorithm} a été sélectionné comme meilleur algorithme avec le meilleur score composite orienté classification ({score_value:.4f}).",
                "Ce score combine F1-Score (40%), précision globale/accuracy (40%), précision pondérée (10%) et rappel pondéré (10%) pour privilégier les modèles équilibrés.",
                f"Détails des performances : F1-Score = {f1_val:.4f}, accuracy = {acc_val:.4f}, précision = {prec_val:.4f}, rappel = {rec_val:.4f}.",
                "Cela indique un bon compromis entre faux positifs et faux négatifs, utile sur des classes potentiellement déséquilibrées.",
                "Le SVM profite aussi du prétraitement par normalisation pour conserver une marge de décision stable, ce qui limite le sur-apprentissage."
            ]
        else:
            primary_metric = 'R²'
            primary_value = metrics['r2_score']
            justification_parts = [
                f"{algorithm} a été sélectionné comme meilleur algorithme avec un score R² de {primary_value:.4f}.",
                f"Ce modèle explique {primary_value*100:.2f}% de la variance de la cible, avec RMSE = {metrics['rmse']:.4f} et MAE = {metrics['mae']:.4f}.",
                "La combinaison d'un biais limité et d'une variance contrôlée en fait un choix adapté pour généraliser sur de nouvelles données."
            ]

        # Ajout de la comparaison avec le deuxième meilleur (en français)
        if len(all_results) > 1:
            second_best = all_results[1]
            try:
                improvement = ((best_model['score'] - second_best['score']) / abs(second_best['score'])) * 100
            except Exception:
                improvement = 0.0
            justification_parts.append(
                f"Il devance le deuxième meilleur algorithme ({second_best['algorithm']}) de {improvement:.2f}% sur le {primary_metric}."
            )
            if model_type == 'classification':
                sb_metrics = second_best.get('metrics', {})
                sb_acc = sb_metrics.get('accuracy')
                sb_f1 = sb_metrics.get('f1_score')
                if sb_acc is not None and sb_f1 is not None:
                    justification_parts.append(
                        f"Avantage supplémentaire : accuracy +{acc_val - sb_acc:.4f} et F1 +{f1_val - sb_f1:.4f}, confirmant une meilleure stabilité."
                    )
        return " ".join(justification_parts)

def generate_report_file(
    model_name: str,
    description: str,
    model_type: str,
    input_features: List[str],
    output_feature: str,
    results: List[Dict[str, Any]],
    justification: str,
    models_dir: str
) -> str:
    """Crée un rapport texte résumant l'entraînement et renvoie le nom de fichier."""
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    safe_model_name = (model_name or 'model').replace(' ', '_')
    filename = f"{safe_model_name}_rapport_{timestamp}.txt"
    filepath = os.path.join(models_dir, filename)

    lines = []
    lines.append("=== Rapport d'entraînement ===")
    lines.append(f"Horodatage (UTC) : {datetime.utcnow().isoformat()}")
    lines.append(f"Nom du modèle : {model_name or 'Non spécifié'}")
    lines.append(f"Description : {description or 'Non spécifiée'}")
    lines.append(f"Type : {model_type}")
    lines.append(f"Caractéristiques (features) : {', '.join(input_features) if input_features else 'Aucune'}")
    lines.append(f"Cible (target) : {output_feature or 'Non spécifiée'}")
    lines.append("")
    lines.append("Résultats par algorithme :")
    for res in results:
        lines.append(f"- {res['algorithm']}")
        metrics = res.get('metrics', {})
        for k, v in metrics.items():
            try:
                formatted = f"{float(v):.6f}"
            except Exception:
                formatted = str(v)
            lines.append(f"    {k}: {formatted}")
    lines.append("")
    lines.append("Meilleur modèle :")
    lines.append(f"{justification}")

    os.makedirs(models_dir, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    return filename

@app.route('/api/train', methods=['POST'])
def train_model():
    try:
        # Get request data
        data = request.json
        model_name = data.get('model_name')
        description = data.get('description')
        model_type = data.get('model_type')  # 'classification' or 'regression'
        csv_data = data.get('csv_data')
        input_features = data.get('input_features')
        output_feature = data.get('output_feature')
        example_payload = None
        
        # Parse CSV data (try robustly to handle semicolons or commas)
        try:
            df = robust_read_csv(csv_data)
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 400
        
        # Build example payload from first row (non-null) if possible
        try:
            if not df.empty:
                first_valid = df.dropna().iloc[0]
                example_payload = {}
                for feat in input_features or []:
                    if feat in first_valid:
                        val = first_valid[feat]
                        if hasattr(val, "item"):
                            val = val.item()
                        example_payload[feat] = val
        except Exception as e:
            print("example payload build failed:", str(e))
        
        # Initialize trainer
        trainer = MLModelTrainer(model_type)

        # Train and evaluate
        results = trainer.train_and_evaluate(df, input_features, output_feature)

        # Réentraîner le meilleur modèle sur l'ensemble du jeu de données et le sauvegarder
        best_algorithm_name = results['best_model']
        algorithms = trainer.get_algorithms()
        best_estimator = algorithms.get(best_algorithm_name)
        model_file = None
        report_file = None
        models_dir = os.path.join(os.path.dirname(__file__), 'models')
        primary_metric_value = None
        best_metrics_blob = None
        if best_estimator is not None:
            # Preprocess full data and scale
            X_full, y_full = trainer.preprocess_data(df, input_features, output_feature)
            X_full_scaled = trainer.scaler.fit_transform(X_full)
            try:
                best_estimator.fit(X_full_scaled, y_full)
                artifact = {
                    'model': best_estimator,
                    'scaler': trainer.scaler,
                    'label_encoders': trainer.label_encoders,
                    'input_features': input_features,
                    'output_feature': output_feature,
                    'model_type': model_type,
                }
                # capture primary metric for stats
                primary_metric_value = results['results'][0].get('score')
                try:
                    best_metrics_blob = json.dumps({
                        'metrics': results['results'][0].get('metrics', {}),
                        'example_payload': example_payload
                    })
                except Exception:
                    best_metrics_blob = None
                os.makedirs(models_dir, exist_ok=True)
                safe_model_name = (model_name or 'model').replace(' ', '_')
                filename = f"{safe_model_name}.pkl"
                filepath = os.path.join(models_dir, filename)
                joblib.dump(artifact, filepath)
                model_file = filename
            except Exception as e:
                print('Error saving model:', str(e))
                model_file = None

        # GǸnǸrer un rapport texte
        try:
            report_file = generate_report_file(
                model_name=model_name,
                description=description,
                model_type=model_type,
                input_features=input_features,
                output_feature=output_feature,
                results=results['results'],
                justification=results['justification'],
                models_dir=models_dir
            )
        except Exception as e:
            print('Error generating report:', str(e))
            report_file = None

        # Sauvegarder les métadonnées en base MySQL (best-effort)
        try:
            insert_model_metadata(
                model_name=model_name or '',
                description=description or '',
                model_type=model_type or '',
                input_features=input_features or [],
                output_feature=output_feature or '',
                best_algorithm=results['best_model'],
                justification=results['justification'],
                model_file=model_file,
                report_file=report_file,
                metric_primary=primary_metric_value,
                metrics_json=best_metrics_blob
            )
        except Exception as e:
            print('MySQL metadata insert error:', str(e))

        return jsonify({
            'success': True,
            'model_name': model_name,
            'description': description,
            'model_type': model_type,
            'results': results['results'],
            'best_model': results['best_model'],
            'justification': results['justification'],
            'model_file': model_file,
            'report_file': report_file
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/download-model', methods=['GET'])
def download_model():
    filename = request.args.get('filename')
    if not filename:
        return jsonify({'success': False, 'error': 'filename parameter is required'}), 400
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    file_path = os.path.join(models_dir, filename)
    if not os.path.exists(file_path):
        return jsonify({'success': False, 'error': 'File not found'}), 404
    return send_from_directory(models_dir, filename, as_attachment=True)

@app.route('/api/download-report', methods=['GET'])
def download_report():
    filename = request.args.get('filename')
    if not filename:
        return jsonify({'success': False, 'error': 'filename parameter is required'}), 400
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    file_path = os.path.join(models_dir, filename)
    if not os.path.exists(file_path):
        return jsonify({'success': False, 'error': 'File not found'}), 404
    return send_from_directory(models_dir, filename, as_attachment=True)

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    models = fetch_models()
    stats = compute_global_stats(models)
    return jsonify({'success': True, **stats})

@app.route('/api/models', methods=['GET'])
def list_models():
    models = fetch_models()
    payload = []
    for m in models:
        payload.append({
            'id': m.get('id'),
            'name': m.get('model_name'),
            'type': m.get('model_type'),
            'precision': m.get('metric_primary'),
            'created_at': m.get('created_at').isoformat() if m.get('created_at') else None,
            'status': 'active',
            'algorithm': m.get('best_algorithm'),
            'description': m.get('description'),
        })
    return jsonify({'success': True, 'models': payload})

@app.route('/api/models/<int:model_id>', methods=['GET'])
def model_details(model_id: int):
    m = fetch_model_by_id(model_id)
    if m is None:
        return jsonify({'success': False, 'error': 'Model not found'}), 404

    metrics = {}
    example_payload = None
    try:
        if m.get('metrics_json'):
            metrics = json.loads(m.get('metrics_json'))
            if isinstance(metrics, dict) and 'metrics' in metrics:
                example_payload = metrics.get('example_payload')
                metrics = metrics.get('metrics') or {}
    except Exception:
        metrics = {}
    details = {
        'id': m.get('id'),
        'name': m.get('model_name'),
        'description': m.get('description'),
        'type': m.get('model_type'),
        'algorithm': m.get('best_algorithm'),
        'created_at': m.get('created_at').isoformat() if m.get('created_at') else None,
        'status': 'active',
        'metrics': metrics,
        'example_payload': example_payload,
        'precision': m.get('metric_primary'),
        'features': (m.get('input_features') or '').split(',') if m.get('input_features') else [],
        'target': m.get('output_feature'),
        'training_history': [],
        'dataset_info': {},
        'model_file': m.get('model_file'),
        'report_file': m.get('report_file'),
    }
    try:
        details['api_stats'] = get_api_stats(m.get('id'))
    except Exception:
        details['api_stats'] = None
    return jsonify({'success': True, **details})

@app.route('/api/models/<int:model_id>', methods=['DELETE'])
def delete_model_endpoint(model_id: int):
    try:
        deleted = delete_model_and_usage(model_id)
        if deleted is None:
            return jsonify({'success': False, 'error': 'Model not found'}), 404
        return jsonify({'success': True, 'deleted_id': model_id})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/models/<int:model_id>/api-stats', methods=['GET'])
def model_api_stats(model_id: int):
    try:
        stats = get_api_stats(model_id)
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e), 'stats': None}), 500

@app.route('/api/models/<int:model_id>/api-stats/copy', methods=['POST'])
def model_api_stats_copy(model_id: int):
    """Log a copy event when a user copies the prediction payload."""
    model = fetch_model_by_id(model_id)
    model_file = model.get('model_file') if model else None
    try:
        log_api_event(model_id, model_file, 'copy', True, latency_ms=None, cpu_percent=None, ram_mb=None)
    except Exception as e:
        print('log copy event failed:', str(e))
    return jsonify({'success': True})

def preprocess_payload(features: Dict[str, Any], artifact: Dict[str, Any]):
    """Apply stored encoders/scaler to a single payload."""
    input_features = artifact.get('input_features', [])
    label_encoders = artifact.get('label_encoders', {})
    scaler = artifact.get('scaler')
    # Build dataframe from payload
    row = {feat: features.get(feat) for feat in input_features}
    df = pd.DataFrame([row])
    # Encode categorical same as training
    for col, enc in label_encoders.items():
        if col == 'target':
            continue
        if col in df:
            try:
                df[col] = enc.transform(df[col].astype(str))
            except Exception:
                # Handle unseen categories by mapping to closest known (fallback to first class)
                known = set(enc.classes_)
                df[col] = df[col].astype(str).apply(lambda v: v if v in known else list(known)[0])
                df[col] = enc.transform(df[col])
    X_scaled = scaler.transform(df)
    return X_scaled

@app.route('/api/predict', methods=['POST'])
def predict():
    """Load saved model artifact and run inference on provided features."""
    start_time = time.perf_counter()
    latency_ms = None
    cpu_percent_val = None
    ram_mb_val = None
    success = False
    status_code = 200
    resolved_model_id = None
    filename = None
    response_payload: Dict[str, Any] = {}
    try:
        data = request.json or {}
        filename = data.get('model_file')
        resolved_model_id = data.get('model_id')
        features = data.get('features')
        if not filename:
            raise ValueError('model_file is required')
        if not isinstance(features, dict):
            raise ValueError('features must be a JSON object')
        if resolved_model_id is None and filename:
            try:
                meta = fetch_model_by_file(filename)
                if meta:
                    resolved_model_id = meta.get('id')
            except Exception:
                resolved_model_id = None
        models_dir = os.path.join(os.path.dirname(__file__), 'models')
        file_path = os.path.join(models_dir, filename)
        if not os.path.exists(file_path):
            status_code = 404
            raise FileNotFoundError('Model file not found')
        artifact = joblib.load(file_path)
        X_scaled = preprocess_payload(features, artifact)
        model = artifact.get('model')
        preds = model.predict(X_scaled)
        # Decode classification labels if encoder exists
        if artifact.get('model_type') == 'classification' and 'target' in artifact.get('label_encoders', {}):
            target_enc = artifact['label_encoders']['target']
            preds = target_enc.inverse_transform(preds)
        # Convert numpy types to native
        preds_list = [p.item() if hasattr(p, 'item') else p for p in preds]
        success = True
        response_payload = {'success': True, 'predictions': preds_list}
    except Exception as e:
        if status_code == 200:
            status_code = 400
        response_payload = {'success': False, 'error': str(e)}
    finally:
        latency_ms = round((time.perf_counter() - start_time) * 1000, 3)
        try:
            cpu_percent_val = psutil.cpu_percent(interval=None)
        except Exception:
            cpu_percent_val = None
        try:
            process = psutil.Process(os.getpid())
            ram_mb_val = process.memory_info().rss / (1024 * 1024)
        except Exception:
            try:
                ram_mb_val = psutil.virtual_memory().used / (1024 * 1024)
            except Exception:
                ram_mb_val = None
        try:
            log_api_event(resolved_model_id, filename, 'predict', success, latency_ms, cpu_percent_val, ram_mb_val)
        except Exception as log_err:
            print('log api event failed:', str(log_err))

    # Optionally return a lightweight usage summary
    try:
        if success and resolved_model_id is not None:
            usage = get_api_stats(resolved_model_id)
            response_payload['usage'] = {
                'total_predictions': usage.get('total_predictions'),
                'total_copies': usage.get('total_copies'),
                'avg_latency_ms': usage.get('avg_latency_ms'),
                'success_rate': usage.get('success_rate'),
                'last_used_at': usage.get('last_used_at'),
            }
    except Exception as e:
        print('fetch usage stats failed:', str(e))

    return jsonify(response_payload), (200 if success else status_code)

@app.route('/api/parse-csv', methods=['POST'])
def parse_csv():
    try:
        csv_data = request.json.get('csv_data')
        try:
            df = robust_read_csv(csv_data)
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 400
        
        return jsonify({
            'success': True,
            'columns': df.columns.tolist(),
            'sample_data': df.head(5).to_dict('records'),
            'row_count': len(df),
            'column_types': df.dtypes.astype(str).to_dict()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
