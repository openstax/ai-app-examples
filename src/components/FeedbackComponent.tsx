import React, { useState } from 'react';
import { FaRegThumbsUp, FaRegThumbsDown, FaXmark } from 'react-icons/fa6';
import {
  DialogTrigger,
  Button,
  Popover,
  Dialog,
  TextField,
  Label,
  TextArea,
  OverlayTriggerStateContext
} from 'react-aria-components';
import './FeedbackComponent.css';

export interface FeedbackProps {
  setRating: (rating: -1 | 1) => void;
  setFeedback: (feedback: { rating: number; feedback: string }) => void;
  onClear: () => void;
}

interface FeedbackPopoverContentProps {
  feedbackText: string;
  setFeedbackText: (text: string) => void;
  onSave: () => void;
  onClear: () => void;
  onClose: () => void;
}

const FeedbackPopoverContent: React.FC<FeedbackPopoverContentProps> = ({
  feedbackText,
  setFeedbackText,
  onSave,
  onClear,
  onClose
}) => {
  const state = React.useContext(OverlayTriggerStateContext);

  const handleSave = () => {
    onSave();
    state?.close();
  };

  const handleClear = () => {
    onClear();
    state?.close();
  };

  const handleClose = () => {
    onClose();
    state?.close();
  };

  return (
    <Dialog className="feedback-popover">
      <div className="popover-content">
        <div className="popover-header">
          <Button
            className="close-button"
            onPress={handleClose}
            aria-label="Close feedback popover"
          >
            <FaXmark />
          </Button>
        </div>

        <TextField>
          <Label>Additional comments (optional)</Label>
          <TextArea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share more details about your feedback..."
            className="feedback-input"
          />
        </TextField>

        <div className="popover-actions">
          <Button onPress={handleSave} className="save-button">
            Save Feedback
          </Button>
          <Button onPress={handleClear} className="clear-button">
            Clear
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export const Feedback: React.FC<FeedbackProps> = ({
  setRating,
  setFeedback,
  onClear
}) => {
  const [selectedRating, setSelectedRating] = useState<-1 | 1 | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const handleButtonClick = (rating: -1 | 1) => {
    setRating(rating);
    setSelectedRating(rating);
  };

  const handleSave = () => {
    if (selectedRating !== null) {
      setFeedback({
        rating: selectedRating,
        feedback: feedbackText
      });
    }
  };

  const handleClear = () => {
    setSelectedRating(null);
    setFeedbackText('');
    onClear();
  };

  return (
    <div className="feedback-component">
      <div className="feedback-buttons">
        <DialogTrigger>
          <Button
            className={`feedback-button ${selectedRating === 1 ? 'selected' : ''}`}
            onPress={() => handleButtonClick(1)}
            aria-label="Thumbs up"
          >
            <FaRegThumbsUp />
          </Button>
          <Popover placement="bottom" offset={5}>
            <FeedbackPopoverContent
              feedbackText={feedbackText}
              setFeedbackText={setFeedbackText}
              onSave={handleSave}
              onClear={handleClear}
              onClose={() => {}}
            />
          </Popover>
        </DialogTrigger>

        <DialogTrigger>
          <Button
            className={`feedback-button ${selectedRating === -1 ? 'selected' : ''}`}
            onPress={() => handleButtonClick(-1)}
            aria-label="Thumbs down"
          >
            <FaRegThumbsDown />
          </Button>
          <Popover placement="bottom" offset={5}>
            <FeedbackPopoverContent
              feedbackText={feedbackText}
              setFeedbackText={setFeedbackText}
              onSave={handleSave}
              onClear={handleClear}
              onClose={() => {}}
            />
          </Popover>
        </DialogTrigger>
      </div>
    </div>
  );
};
