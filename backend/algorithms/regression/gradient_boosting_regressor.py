import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin
from decision_tree_regressor import DecisionTreeRegressorCustom

class GradientBoostingRegressorCustom(BaseEstimator):
    """
    Gradient Boosting Regressor
    """ 
    def __init__(self, n_estimators=100, learning_rate=0.1, max_depth=3):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.max_depth = max_depth
        self.trees = []
        self.init_prediction = None
        
    def fit(self, X, y):
        # Initialize with mean
        self.init_prediction = np.mean(y)
        
        F = np.full(len(y), self.init_prediction)
        
        for _ in range(self.n_estimators):
            # Compute pseudo-residuals
            residuals = y - F
            
            # Fit tree to residuals
            tree = DecisionTreeRegressorCustom(max_depth=self.max_depth)
            tree.fit(X, residuals)
            
            # Update predictions
            predictions = tree.predict(X)
            F += self.learning_rate * predictions
            
            self.trees.append(tree)
        
        return self
    
    def predict(self, X):
        F = np.full(X.shape[0], self.init_prediction)
        
        for tree in self.trees:
            predictions = tree.predict(X)
            F += self.learning_rate * predictions
        
        return F