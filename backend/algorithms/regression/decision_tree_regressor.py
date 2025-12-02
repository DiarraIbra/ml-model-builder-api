import numpy as np
from sklearn.base import BaseEstimator, ClassifierMixin

# algorithms/regression/decision_tree_regressor.py
class NodeRegressor:
    def __init__(self, feature=None, threshold=None, left=None, right=None, value=None):
        self.feature = feature
        self.threshold = threshold
        self.left = left
        self.right = right
        self.value = value
        
    def is_leaf(self):
        return self.value is not None

class DecisionTreeRegressorCustom(BaseEstimator):
    """
    Decision Tree Regressor
    """
    def __init__(self, max_depth=10, min_samples_split=2):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.root = None
        
    def mse(self, y):
        if len(y) == 0:
            return 0
        return np.var(y)
    
    def split(self, X, y, feature, threshold):
        left_mask = X[:, feature] <= threshold
        right_mask = ~left_mask
        return X[left_mask], X[right_mask], y[left_mask], y[right_mask]
    
    def best_split(self, X, y):
        best_mse = float('inf')
        best_feature = None
        best_threshold = None
        
        n_features = X.shape[1]
        
        for feature in range(n_features):
            thresholds = np.unique(X[:, feature])
            
            for threshold in thresholds:
                X_left, X_right, y_left, y_right = self.split(X, y, feature, threshold)
                
                if len(y_left) == 0 or len(y_right) == 0:
                    continue
                
                mse = (len(y_left) / len(y)) * self.mse(y_left) + \
                      (len(y_right) / len(y)) * self.mse(y_right)
                
                if mse < best_mse:
                    best_mse = mse
                    best_feature = feature
                    best_threshold = threshold
        
        return best_feature, best_threshold
    
    def build_tree(self, X, y, depth=0):
        n_samples = X.shape[0]
        
        # Stopping criteria
        if depth >= self.max_depth or n_samples < self.min_samples_split:
            leaf_value = np.mean(y)
            return NodeRegressor(value=leaf_value)
        
        # Find best split
        feature, threshold = self.best_split(X, y)
        
        if feature is None:
            leaf_value = np.mean(y)
            return NodeRegressor(value=leaf_value)
        
        # Split and recurse
        X_left, X_right, y_left, y_right = self.split(X, y, feature, threshold)
        left = self.build_tree(X_left, y_left, depth + 1)
        right = self.build_tree(X_right, y_right, depth + 1)
        
        return NodeRegressor(feature, threshold, left, right)
    
    def fit(self, X, y):
        self.root = self.build_tree(X, y)
        return self
    
    def predict_sample(self, x, node):
        if node.is_leaf():
            return node.value
        
        if x[node.feature] <= node.threshold:
            return self.predict_sample(x, node.left)
        return self.predict_sample(x, node.right)
    
    def predict(self, X):
        return np.array([self.predict_sample(x, self.root) for x in X])
