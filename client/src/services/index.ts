import axios from "axios";

// Axios POST request to send an email
const sendEmail = async (emailData: any) => {
  try {
    const response = await axios.post("http://localhost:8080/api/v1/mail", emailData);
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
