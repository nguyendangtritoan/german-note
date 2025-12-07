import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Icon } from './ui/Icon';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {/* FIX: Added 'p-6' padding to push content away from borders */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-2 rounded-full shrink-0">
            <Icon name="AlertTriangle" className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2">
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
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;