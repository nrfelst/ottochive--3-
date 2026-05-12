import sys
import os
import pandas as pd
from train import train_model

def retrain(text, label):
    valid_classes = ['POSITIVE_REPLY', 'SOFT_NO', 'UNSUBSCRIBE', 'OOO', 'INTERESTED_NOT_READY']
    
    if label not in valid_classes:
        print(f"Error: Label must be one of {valid_classes}")
        sys.exit(1)
        
    data_path = "data/email_labels.csv"
    
    # Append to CSV
    new_data = pd.DataFrame([[text, label]], columns=['text', 'label'])
    new_data.to_csv(data_path, mode='a', header=False, index=False)
    
    # Re-run training
    train_model()
    
    # Print stats
    df = pd.read_csv(data_path)
    print(f"\nTotal rows in CSV: {len(df)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print('Usage: python retrain.py "email text here" LABEL')
        sys.exit(1)
        
    email_text = sys.argv[1]
    email_label = sys.argv[2]
    retrain(email_text, email_label)
