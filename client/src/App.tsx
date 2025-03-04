import { useState } from "react";
import Papa from "papaparse";
import sendEmail from "./services";
import { MdEmail, MdFileUpload, MdHelpOutline } from "react-icons/md";
import Modal from "./components/Modal";

function App() {
  const [formData, setFormData] = useState({
    from: "",
    password: "",
    subject: "",
    text: "",
  });
  const [csvData, setCsvData] = useState([]);
  const [sortConfig, setSortConfig] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update form state when an input changes.
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Parse CSV file upload and add fields for status tracking.
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      complete: (result) => {
        const dataWithSentStatus = result.data.map((row) => ({
          ...row,
          Sent: "",
          error: "",
        }));
        setCsvData(dataWithSentStatus);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  // Sort table data based on header clicks.
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCsvData((prevData) =>
      [...prevData].sort((a, b) => {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  // Process and send emails to each recipient, updating status accordingly.
  const handleEmailSend = async () => {
    for (let row of csvData) {
      const emailData = {
        from: formData.from,
        password: formData.password,
        to: row["Email"],
        subject: formData.subject,
        text: formData.text,
      };

      try {
        row.Sent = "Loading";
        row.error = "";
        setCsvData([...csvData]);
        const result = await sendEmail(emailData);
        console.log("Email sent to", row["Email"], result);
        row.Sent = "Sent";
      } catch (error) {
        console.error("Failed to send email to", row["Email"]);
        row.Sent = "Error";
        row.error = error.message || "An error occurred";
      }
      setCsvData([...csvData]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-gray-100 flex items-center gap-2">
            <MdEmail className="text-blue-400" /> Email Sender
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <MdHelpOutline /> How to Use
          </button>
        </div>

        <form className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["from", "password"].map((field) => (
              <div key={field} className="relative">
                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  placeholder=" "
                  value={formData[field]}
                  onChange={handleChange}
                  className="peer w-full p-4 rounded-xl bg-gray-800 bg-opacity-80 border-2 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:bg-gray-800 transition-all text-gray-100 placeholder-transparent"
                />
                <label className="absolute left-4 top-4 text-gray-400 transition-all duration-200 ease-in-out 
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base 
        peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-500">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
              </div>
            ))}
          </div>

          {/* "Subject" input on its own row with floating label */}
          <div className="relative">
            <input
              type="text"
              name="subject"
              placeholder=" "
              value={formData.subject}
              onChange={handleChange}
              className="peer w-full p-4 rounded-xl bg-gray-800 bg-opacity-80 placeholder-transparent border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800 transition-all text-gray-100"
            />
            <label className="absolute left-4 top-4 text-gray-400 transition-all peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-xs peer-placeholder-shown:text-base">
              Subject
            </label>
          </div>

          {/* Email Body Textarea with floating label */}
          <div className="relative">
            <textarea
              name="text"
              placeholder=" "
              value={formData.text}
              onChange={handleChange}
              rows={6}
              className="peer w-full p-4 rounded-xl bg-gray-800 bg-opacity-80 placeholder-transparent border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-800 transition-all text-gray-100"
            />
            <label className="absolute left-4 top-4 text-gray-400 transition-all peer-placeholder-shown:top-4 peer-focus:top-0 peer-focus:text-xs peer-placeholder-shown:text-base">
              Email Body (use line breaks for new lines)
            </label>
          </div>

          {/* File Upload Section with Icon */}
          <div className="mt-4">
            <label className="block text-gray-300 font-medium mb-2 flex items-center gap-2">
              <MdFileUpload className="text-blue-400" /> Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full p-3 bg-gray-800 bg-opacity-80 text-white border border-gray-700 rounded-xl cursor-pointer focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* CSV Table Section */}
          {csvData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-gray-200 mb-4">CSV Data</h3>
              <div className="overflow-x-auto bg-gray-900 bg-opacity-70 border border-gray-700 rounded-xl shadow-lg">
                <table className="w-full table-auto">
                  <thead className="sticky top-0 bg-gray-800 bg-opacity-90 backdrop-blur-sm">
                    <tr>
                      {Object.keys(csvData[0]).map((key) => (
                        <th
                          key={key}
                          className="p-3 text-left cursor-pointer hover:underline"
                          onClick={() => handleSort(key)}
                        >
                          {key}
                          {sortConfig && sortConfig.key === key
                            ? sortConfig.direction === "asc"
                              ? " ▲"
                              : " ▼"
                            : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.map((row, i) => (
                      <tr key={i} className="odd:bg-gray-800 even:bg-gray-700 hover:bg-gray-600 transition duration-300">
                        {Object.entries(row).map(([key, value], j) => {
                          if (key === "Sent") {
                            return (
                              <td
                                key={j}
                                className={`p-3 border border-gray-700 text-center relative group ${value === "Sent"
                                    ? "bg-green-600"
                                    : value === "Error"
                                      ? "bg-red-600"
                                      : value === "Loading"
                                        ? "bg-yellow-600"
                                        : "bg-gray-700"
                                  }`}
                              >
                                {value === "Loading" ? (
                                  <svg
                                    className="animate-spin h-5 w-5 mx-auto"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v8z"
                                    ></path>
                                  </svg>
                                ) : (
                                  value
                                )}
                                {value === "Error" && row.error && (
                                  <div className="mt-2 w-full p-2 bg-red-700 text-xs rounded shadow-lg hidden group-hover:block">
                                    {row.error}
                                  </div>
                                )}
                              </td>
                            );
                          }
                          return (
                            <td key={j} className="p-3 border border-gray-700">
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Send Emails Button with enhanced styling */}
          <button
            type="button"
            onClick={handleEmailSend}
            className="w-full p-4 mt-6 bg-blue-600 hover:bg-blue-700 transition rounded-xl text-white font-semibold shadow-lg"
          >
            Send Emails
          </button>
        </form>
      </div>
      {/* Modal for usage instructions */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default App;
