import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin

# algorithms/regression/svr_regressor.py
class SVRCustom(BaseEstimator):
    """
    Support Vector Regression
    """
    def __init__(self, C=1.0, epsilon=0.1, max_iterations=1000, learning_rate=0.001):
        self.C = C
        self.epsilon = epsilon
        self.max_iterations = max_iterations
        self.learning_rate = learning_rate
        self.weights = None
        self.bias = None
        
    def fit(self, X, y):
        n_samples, n_features = X.shape
        
        self.weights = np.zeros(n_features)
        self.bias = 0
        
        for _ in range(self.max_iterations):
            for idx, x_i in enumerate(X):
                prediction = np.dot(x_i, self.weights) + self.bias
                error = y[idx] - prediction
                
                if abs(error) <= self.epsilon:
                    self.weights -= self.learning_rate * (2 * self.weights / self.max_iterations)
                else:
                    self.weights -= self.learning_rate * (
                        2 * self.weights / self.max_iterations - self.C * x_i * np.sign(error)
                    )
                    self.bias -= self.learning_rate * self.C * np.sign(error)
        
        return self
    
    def predict(self, X):
        return np.dot(X, self.weights) + self.bias

