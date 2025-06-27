export const registerEmailTemplate = (content) => `
  <div style="font-family: Arial, sans-serif; color: #d6cbd1; padding: 20px;">

    <div style="; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">

    <h1 style="color: #800020; font-size: 30px; line-height: 1.5; text-align: center;">Congratulations!</h1>

      <div style="color:#000000; font-size: 18px; line-height: 1.5; text-align: start;">
        ${content}
      </div>

      <footer style="margin-top: 30px; font-size: 12px; color: #777; text-align: start;">
        <p>&copy; ${new Date().getFullYear()} Castor Care Ghana. All rights reserved.</p>
      </footer>

    </div>
  </div>
`;