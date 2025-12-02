import React, { useState } from 'react';
import InputField from './InputField'; // Assuming InputField is a reusable component
import ImageUploader from './ImageUploader'; // Assuming ImageUploader is a reusable component

const AssignmentDetails = ({ dealId, onPostAssignment }) => {
  const [contractPrice, setContractPrice] = useState('');
  const [assignmentFee, setAssignmentFee] = useState('');
  const [emd, setEmd] = useState('');
  const [inspectionWindow, setInspectionWindow] = useState(''); // in days
  const [closingDate, setClosingDate] = useState(''); // YYYY-MM-DD
  const [proofOfContract, setProofOfContract] = useState(null); // File object
  const [hasValidContract, setHasValidContract] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasValidContract) {
      alert('You must certify that you have a valid, assignable equitable interest.');
      return;
    }

    const assignmentData = {
      dealId, // Link to the original deal, if applicable
      contractPrice: parseFloat(contractPrice),
      assignmentFee: parseFloat(assignmentFee),
      totalPurchasePrice: parseFloat(contractPrice) + parseFloat(assignmentFee),
      emd: parseFloat(emd),
      inspectionWindow: parseInt(inspectionWindow),
      closingDate,
      proofOfContract, // This would be uploaded to Firebase Storage
      hasValidContract,
      postedAt: new Date().toISOString(),
    };

    console.log('Posting Assignment:', assignmentData);
    // In a real application, you'd call a service here to upload to Firestore and Storage
    onPostAssignment(assignmentData);
    alert('Assignment details submitted! (Proof of contract would be uploaded now.)');
    // Reset form or navigate away
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Post Assignment Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Contract Price ($)"
          type="number"
          value={contractPrice}
          onChange={(e) => setContractPrice(e.target.value)}
          placeholder="e.g., 150000"
          required
        />
        <InputField
          label="Assignment Fee ($)"
          type="number"
          value={assignmentFee}
          onChange={(e) => setAssignmentFee(e.target.value)}
          placeholder="e.g., 10000"
          required
        />
        <InputField
          label="Earnest Money Deposit (EMD) ($)"
          type="number"
          value={emd}
          onChange={(e) => setEmd(e.target.value)}
          placeholder="e.g., 1000"
          required
        />
        <InputField
          label="Inspection Window (days)"
          type="number"
          value={inspectionWindow}
          onChange={(e) => setInspectionWindow(e.target.value)}
          placeholder="e.g., 7"
          required
        />
        <InputField
          label="Closing Date"
          type="date"
          value={closingDate}
          onChange={(e) => setClosingDate(e.target.value)}
          required
        />

        {/* Proof of Contract Upload */}
        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Contract (Redacted PDF)</label>
          <ImageUploader onImageUpload={setProofOfContract} initialImage={null} />
          {proofOfContract && <p className="text-sm text-gray-500 mt-1">File selected: {proofOfContract.name}</p>}
        </div>

        {/* Disclaimer Checkbox */}
        <div className="flex items-center">
          <input
            id="hasValidContract"
            name="hasValidContract"
            type="checkbox"
            checked={hasValidContract}
            onChange={(e) => setHasValidContract(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="hasValidContract" className="ml-2 block text-sm text-gray-900">
            I certify I have a valid, assignable equitable interest in this property.
          </label>
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post Assignment
        </button>
      </form>
    </div>
  );
};

export default AssignmentDetails;
