import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin


# algorithms/classification/svm_classifier.py
class SVMClassifierCustom(BaseEstimator, ClassifierMixin):
    """
    Support Vector Machine using Sequential Minimal Optimization (simplified)
    """
    def __init__(self, C=1.0, kernel='linear', max_iterations=1000, learning_rate=0.001):
        self.C = C
        self.kernel = kernel
        self.max_iterations = max_iterations
        self.learning_rate = learning_rate
        self.weights = None
        self.bias = None
        
    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.classes_ = np.unique(y)
        
        # Binary classification only (for simplicity)
        y_binary = np.where(y == self.classes_[1], 1, -1)
        
        self.weights = np.zeros(n_features)
        self.bias = 0
        
        # Gradient descent
        for _ in range(self.max_iterations):
            for idx, x_i in enumerate(X):
                condition = y_binary[idx] * (np.dot(x_i, self.weights) + self.bias) >= 1
                
                if condition:
                    self.weights -= self.learning_rate * (2 * self.weights / self.max_iterations)
                else:
                    self.weights -= self.learning_rate * (
                        2 * self.weights / self.max_iterations - np.dot(x_i, y_binary[idx])
                    )
                    self.bias -= self.learning_rate * y_binary[idx]
        
        return self
    
    def predict(self, X):
        linear_output = np.dot(X, self.weights) + self.bias
        predictions = np.sign(linear_output)
        return np.where(predictions == 1, self.classes_[1], self.classes_[0])
