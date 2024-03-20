import unittest
import os

def run_tests():
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Use the default test loader to discover all tests
    test_loader = unittest.TestLoader()
    test_suite = test_loader.discover(current_dir, pattern='*_test.py')
    
    # Run the test suite
    test_runner = unittest.TextTestRunner()
    test_runner.run(test_suite)

if __name__ == '__main__':
    run_tests()
