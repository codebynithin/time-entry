const handleError = (error) => {
  const status = error.response?.status;

  if (status === 400) {
    console.error('Authentication failed. Your Zoho credentials may have expired or are invalid.');
    console.error(
      'Update your cookie, token, and session id by running `timectl init`, or refresh them from your browser.',
    );

    process.exit(1); // Exit the process with a non-zero status code to indicate failure
  }

  console.error(error.message || String(error));
};

module.exports = { handleError };
