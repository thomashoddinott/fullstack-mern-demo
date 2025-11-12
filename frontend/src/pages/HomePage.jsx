import UserCard from "../components/UserCard";
import MembershipPanel from "../components/MembershipPanel";
import BookClasses from "../components/BookClasses";
import UpcomingClasses from "../components/UpcomingClasses";

export default function HomePage() {
  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Left: User card */}
      <aside className="w-full md:w-1/4">
        <UserCard />
      </aside>

      {/* Right: Main panels */}
      <main className="flex-1 flex flex-col gap-6">
        <MembershipPanel />
        <BookClasses />
        <UpcomingClasses />
      </main>
    </div>
  );
}
