import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin


# algorithms/classification/knn_classifier.py
class KNNClassifierCustom(BaseEstimator, ClassifierMixin):
    """
    K-Nearest Neighbors Classifier
    """
    def __init__(self, k=5):
        self.k = k
        self.X_train = None
        self.y_train = None
        
    def euclidean_distance(self, x1, x2):
        return np.sqrt(np.sum((x1 - x2) ** 2))
    
    def fit(self, X, y):
        self.classes_ = np.unique(y)
        self.X_train = X
        self.y_train = y
        return self
    
    def predict(self, X):
        predictions = []
        
        for x in X:
            distances = [self.euclidean_distance(x, x_train) for x_train in self.X_train]
            k_indices = np.argsort(distances)[:self.k]
            k_nearest_labels = self.y_train[k_indices]
            most_common = np.argmax(np.bincount(k_nearest_labels))
            predictions.append(most_common)
        
        return np.array(predictions)
