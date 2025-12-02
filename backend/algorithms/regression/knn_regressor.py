import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin

# algorithms/regression/knn_regressor.py
class KNNRegressorCustom(BaseEstimator):
    """
    K-Nearest Neighbors Regressor
    """
    def __init__(self, k=5):
        self.k = k
        self.X_train = None
        self.y_train = None
        
    def euclidean_distance(self, x1, x2):
        return np.sqrt(np.sum((x1 - x2) ** 2))
    
    def fit(self, X, y):
        self.X_train = X
        self.y_train = y
        return self
    
    def predict(self, X):
        predictions = []
        
        for x in X:
            distances = [self.euclidean_distance(x, x_train) for x_train in self.X_train]
            k_indices = np.argsort(distances)[:self.k]
            k_nearest_values = self.y_train[k_indices]
            predictions.append(np.mean(k_nearest_values))
        
        return np.array(predictions)

