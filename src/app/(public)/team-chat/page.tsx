import {
  TeamChatMember,
  TeamChatMessage,
  TeamChatWorkspace,
} from "@/app/_components/TeamChatWorkspace";

const members: TeamChatMember[] = [
  {
    id: "s1",
    name: "John Smith",
    initials: "JS",
    role: "Student",
    online: true,
  },
  {
    id: "s2",
    name: "Sarah Ahmed",
    initials: "SA",
    role: "Student",
    online: true,
  },
  {
    id: "prof",
    name: "Dr. Ahmed Hassan",
    initials: "AH",
    role: "Professor",
    online: true,
  },
];

const messages: TeamChatMessage[] = [
  {
    id: "m1",
    author: "Dr. Ahmed Hassan",
    initials: "DAH",
    role: "Professor",
    content:
      "Good morning team! I reviewed your project proposal. Please check the feedback document I shared.",
    timestamp: "09:30 AM",
  },
  {
    id: "m2",
    author: "Dr. Ahmed Hassan",
    initials: "DAH",
    role: "Professor",
    timestamp: "09:31 AM",
    file: {
      name: "Feedback_Project_V1.pdf",
      size: "245 KB",
      type: "pdf",
    },
  },
  {
    id: "m3",
    author: "John Smith",
    initials: "JS",
    role: "Student",
    content:
      "Thank you Professor! We will review it and make the necessary changes.",
    timestamp: "10:15 AM",
  },
  {
    id: "m4",
    author: "Sarah Ahmed",
    initials: "SA",
    role: "Student",
    content:
      "I have updated the system architecture diagram based on the feedback.",
    timestamp: "11:20 AM",
  },
  {
    id: "m5",
    author: "Sarah Ahmed",
    initials: "SA",
    role: "Student",
    timestamp: "11:21 AM",
    file: {
      name: "System_Architecture_V2.png",
      size: "1.2 MB",
      type: "image",
    },
  },
];

export default function StudentTeamChat() {
  return (
    <div className="w-full px-4 py-5 md:px-5 md:py-6">
      <TeamChatWorkspace
        title="Team Chat"
        subtitle="Smart Campus Navigation System - Team A"
        initialMembers={members}
        initialMessages={messages}
        currentUserName="John Smith"
        currentUserRole="Student"
        isTeamLeader={true}
      />
    </div>
  );
}
