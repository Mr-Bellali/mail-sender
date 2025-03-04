import { MdHelpOutline } from "react-icons/md";

const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      {/* Modal Content with glass morphism styling */}
      <div className="relative bg-gray-900 bg-opacity-90 backdrop-blur-lg p-6 rounded-lg z-10 max-w-lg mx-auto shadow-xl border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <MdHelpOutline className="text-blue-400" /> How to Use This Tool
        </h3>
        <p className="text-gray-300 mb-4 text-sm">
          Enter your email credentials, subject, and email body in the fields below.
          Upload a CSV file that contains a column labeled <code>Email</code>. Then click the "Send Emails"
          button to dispatch emails to each address. The status column will update as the emails are processed.
        </p>
        <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          Close
        </button>
      </div>
    </div>
  );
}


export default Modal
