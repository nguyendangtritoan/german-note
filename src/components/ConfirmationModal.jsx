import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Icon } from './ui/Icon';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {/* Warning Icon & Message */}
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-2 rounded-full shrink-0">
            <Icon name="AlertTriangle" className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes, Delete Bundle
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;