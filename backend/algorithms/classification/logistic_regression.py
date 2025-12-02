import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin

class LogisticRegressionCustom(BaseEstimator, ClassifierMixin):
    """
    Logistic Regression using Gradient Descent
    """
    def __init__(self, learning_rate=0.01, n_iterations=1000, regularization=0.01):
        self.learning_rate = learning_rate
        self.n_iterations = n_iterations
        self.regularization = regularization
        self.weights = None
        self.bias = None
        
    def sigmoid(self, z):
        return 1 / (1 + np.exp(-np.clip(z, -500, 500)))
    
    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.classes_ = np.unique(y)
        
        # Binary classification
        if len(self.classes_) == 2:
            y_binary = np.where(y == self.classes_[1], 1, 0)
            self.weights = np.zeros(n_features)
            self.bias = 0
            
            for _ in range(self.n_iterations):
                linear_model = np.dot(X, self.weights) + self.bias
                y_predicted = self.sigmoid(linear_model)
                
                dw = (1/n_samples) * np.dot(X.T, (y_predicted - y_binary)) + (self.regularization * self.weights)
                db = (1/n_samples) * np.sum(y_predicted - y_binary)
                
                self.weights -= self.learning_rate * dw
                self.bias -= self.learning_rate * db
        else:
            # Multi-class using One-vs-Rest
            self.weights = np.zeros((len(self.classes_), n_features))
            self.bias = np.zeros(len(self.classes_))
            
            for idx, cls in enumerate(self.classes_):
                y_binary = np.where(y == cls, 1, 0)
                
                weights = np.zeros(n_features)
                bias = 0
                
                for _ in range(self.n_iterations):
                    linear_model = np.dot(X, weights) + bias
                    y_predicted = self.sigmoid(linear_model)
                    
                    dw = (1/n_samples) * np.dot(X.T, (y_predicted - y_binary)) + (self.regularization * weights)
                    db = (1/n_samples) * np.sum(y_predicted - y_binary)
                    
                    weights -= self.learning_rate * dw
                    bias -= self.learning_rate * db
                
                self.weights[idx] = weights
                self.bias[idx] = bias
        
        return self
    
    def predict(self, X):
        if len(self.classes_) == 2:
            linear_model = np.dot(X, self.weights) + self.bias
            y_predicted = self.sigmoid(linear_model)
            return np.where(y_predicted >= 0.5, self.classes_[1], self.classes_[0])
        else:
            linear_models = np.dot(X, self.weights.T) + self.bias
            y_predicted = self.sigmoid(linear_models)
            return self.classes_[np.argmax(y_predicted, axis=1)]

