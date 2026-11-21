
import SessionBookmark from "../models/sessionBookmark.model.js";
import { transporter } from "../server.js";

const sendSessionReminders = async () => {
  try {
    const now = new Date();

    const reminderTime = new Date(
      now.getTime() + 15 * 60 * 1000
    );

    const bookmarks = await SessionBookmark.find({
      reminderEnabled: true,
      reminderSent: false,
    })
      .populate({
        path: "attendee",
        select: "username email",
      })
      .populate({
        path: "session",
        populate: {
          path: "event",
          select: "title location",
        },
      });
      console.log("Reminder check running...");
      console.log("Total bookmarks found:", bookmarks.length);

    for (const bookmark of bookmarks) {
      const session = bookmark.session;
      const attendee = bookmark.attendee;

      if (!session || !attendee || !attendee.email) {
        continue;
      }

      const sessionStart = new Date(session.startTime);
      console.log("Checking session:", session.title);
      console.log("Attendee:", attendee.email);
      console.log("Session starts:", sessionStart);
      console.log("Current time:", now);
      console.log("Reminder sent:", bookmark.reminderSent);

      // Session must start within the next 15 minutes
      if (sessionStart <= now || sessionStart > reminderTime) {
        continue;
      }

      console.log("Sending reminder email to:", attendee.email);
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: attendee.email,
        subject: `Reminder: ${session.title} starts soon`,
        html: `
          <h2>Hello ${attendee.username},</h2>

          <p>Your bookmarked session is starting soon!</p>

          <h3>${session.title}</h3>

          <p>
            <strong>Start time:</strong>
            ${sessionStart.toLocaleString()}
          </p>

          <p>
            <strong>Event:</strong>
            ${session.event?.title || "Event"}
          </p>

          <p>
            <strong>Location:</strong>
            ${session.event?.location || "Not specified"}
          </p>

          <p>We hope you enjoy the session!</p>
        `,
      });

      console.log("Email sent successfully!");
      
      // Mark reminder as sent only after email succeeds
      bookmark.reminderSent = true;
      await bookmark.save();

      console.log(`Reminder sent to ${attendee.email}`);
    }
  } catch (error) {
    console.error("Session reminder error:", error);
  }
};

export default sendSessionReminders;
