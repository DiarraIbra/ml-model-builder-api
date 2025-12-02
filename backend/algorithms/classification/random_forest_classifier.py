import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin
from decision_tree_classifier import DecisionTreeClassifierCustom

# algorithms/classification/random_forest_classifier.py
class RandomForestClassifierCustom(BaseEstimator, ClassifierMixin):
    """
    Random Forest Classifier using bootstrap aggregating
    """
    def __init__(self, n_estimators=100, max_depth=10, min_samples_split=2):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.trees = []
        
    def bootstrap_sample(self, X, y):
        n_samples = X.shape[0]
        indices = np.random.choice(n_samples, n_samples, replace=True)
        return X[indices], y[indices]
    
    def fit(self, X, y):
        self.classes_ = np.unique(y)
        self.trees = []
        
        for _ in range(self.n_estimators):
            tree = DecisionTreeClassifierCustom(
                max_depth=self.max_depth,
                min_samples_split=self.min_samples_split
            )
            X_sample, y_sample = self.bootstrap_sample(X, y)
            tree.fit(X_sample, y_sample)
            self.trees.append(tree)
        
        return self
    
    def predict(self, X):
        predictions = np.array([tree.predict(X) for tree in self.trees])
        # Majority voting
        return np.array([np.argmax(np.bincount(predictions[:, i])) for i in range(X.shape[0])])
