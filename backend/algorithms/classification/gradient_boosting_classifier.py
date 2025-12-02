import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin
from decision_tree_classifier import DecisionTreeClassifierCustom

# algorithms/classification/gradient_boosting_classifier.py
class GradientBoostingClassifierCustom(BaseEstimator, ClassifierMixin):
    """
    Gradient Boosting Classifier
    """
    def __init__(self, n_estimators=100, learning_rate=0.1, max_depth=3):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.trees = []
        self.init_prediction = None
        
    def sigmoid(self, z):
        return 1 / (1 + np.exp(-np.clip(z, -500, 500)))
    
    def fit(self, X, y):
        self.classes_ = np.unique(y)
        y_binary = np.where(y == self.classes_[1], 1, 0)
        
        # Initialize with mean
        self.init_prediction = np.log(np.mean(y_binary) / (1 - np.mean(y_binary) + 1e-10))
        
        F = np.full(len(y_binary), self.init_prediction)
        
        for _ in range(self.n_estimators):
            # Compute pseudo-residuals
            p = self.sigmoid(F)
            residuals = y_binary - p
            
            # Fit tree to residuals
            tree = DecisionTreeClassifierCustom(max_depth=self.max_depth)
            tree.fit(X, (residuals > 0).astype(int))
            
            # Update predictions
            predictions = tree.predict(X)
            gamma = self.learning_rate * (predictions - 0.5) * 2
            F += gamma
            
            self.trees.append((tree, gamma))
        
        return self
    
    def predict(self, X):
        F = np.full(X.shape[0], self.init_prediction)
        
        for tree, gamma in self.trees:
            predictions = tree.predict(X)
            F += self.learning_rate * (predictions - 0.5) * 2
        
        p = self.sigmoid(F)
        return np.where(p >= 0.5, self.classes_[1], self.classes_[0])

