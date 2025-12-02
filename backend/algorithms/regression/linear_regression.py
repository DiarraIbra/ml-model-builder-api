import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin

# algorithms/regression/linear_regression.py
class LinearRegressionCustom(BaseEstimator):
    """
    Linear Regression using Normal Equation
    """
    def __init__(self, regularization=0.01):
        self.regularization = regularization
        self.weights = None
        self.bias = None
        
    def fit(self, X, y):
        n_samples, n_features = X.shape
        
        # Add bias term
        X_b = np.c_[np.ones((n_samples, 1)), X]
        
        # Normal equation with regularization
        I = np.eye(n_features + 1)
        I[0, 0] = 0  # Don't regularize bias
        
        theta = np.linalg.inv(X_b.T.dot(X_b) + self.regularization * I).dot(X_b.T).dot(y)
        
        self.bias = theta[0]
        self.weights = theta[1:]
        
        return self
    
    def predict(self, X):
        return np.dot(X, self.weights) + self.bias

