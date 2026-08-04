import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from training.train_volunteer_ranking_model import main

if __name__ == "__main__":
    main()
