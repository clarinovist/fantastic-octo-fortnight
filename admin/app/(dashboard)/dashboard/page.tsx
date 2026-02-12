import {
  TrendingUp,
  UserPlus,
  CreditCard,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { getStatisticSubscription, getStatisticUser, getTopSubjectBooked } from "@/services/statistic";
import { getBookings } from "@/services/booking";
import { formatRupiah } from "@/utils/helpers";

export default async function Page() {
  // Calculate date range for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  // Fetch data in parallel using allSettled to prevent one failure from crashing the page
  const [
    revenueResResult,
    userResResult,
    bookingsResResult,
    topSubjectsResResult
  ] = await Promise.allSettled([
    getStatisticSubscription(startDate, endDate),
    getStatisticUser(startDate, endDate),
    getBookings({ page: 1, pageSize: 1 }), // Hack to get total count
    getTopSubjectBooked()
  ]);

  const revenueRes = revenueResResult.status === "fulfilled" ? revenueResResult.value : { success: false, data: null };
  const userRes = userResResult.status === "fulfilled" ? userResResult.value : { success: false, data: null };
  const bookingsRes = bookingsResResult.status === "fulfilled" ? bookingsResResult.value : { success: false, metadata: null };
  const topSubjectsRes = topSubjectsResResult.status === "fulfilled" ? topSubjectsResResult.value : { success: false, data: [] };

  // Extract data with fallbacks
  const revenue = revenueRes.success && revenueRes.data ? revenueRes.data.totalAmount : 0;
  const totalTutors = userRes.success && userRes.data ? userRes.data.totalTutors : 0;
  const totalStudents = userRes.success && userRes.data ? userRes.data.totalStudents : 0;
  const totalBookings = bookingsRes.success && bookingsRes.metadata ? bookingsRes.metadata.total : 0;
  const topSubjects = topSubjectsRes.success && topSubjectsRes.data ? topSubjectsRes.data : [];

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back. Here&apos;s a snapshot of your platform&apos;s performance.
        </p>
      </div>

      {/* Top Row: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-medium" title="Sample data - awaiting backend integration">
                <TrendingUp className="size-3" />
                +12.5%
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{formatRupiah(revenue)}</h3>
          </div>
          {/* Mock Bar Chart Visual */}
          <div className="mt-4 h-12 w-full flex items-end gap-1">
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/2"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-3/4"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-2/3"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-4/5"></div>
            <div className="flex-1 bg-violet-600/20 rounded-t-sm h-full"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-3/4"></div>
            <div className="flex-1 bg-violet-600 rounded-t-sm h-5/6"></div>
          </div>
        </div>

        {/* Active Tutors Card */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-muted-foreground text-sm font-medium">Active Tutors</p>
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-medium" title="Sample data - awaiting backend integration">
                <TrendingUp className="size-3" />
                +5.2%
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalTutors.toLocaleString()}</h3>
          </div>
          <div className="mt-4 h-12 w-full flex items-end gap-1">
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/3"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/2"></div>
            <div className="flex-1 bg-violet-600/20 rounded-t-sm h-2/3"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/2"></div>
            <div className="flex-1 bg-violet-600 rounded-t-sm h-4/5"></div>
            <div className="flex-1 bg-violet-600/20 rounded-t-sm h-3/4"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/2"></div>
          </div>
        </div>

        {/* Active Students Card */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-muted-foreground text-sm font-medium">Active Students</p>
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-medium" title="Sample data - awaiting backend integration">
                <TrendingUp className="size-3" />
                +8.1%
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalStudents.toLocaleString()}</h3>
          </div>
          <div className="mt-4 h-12 w-full flex items-end gap-1">
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/2"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-2/3"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/2"></div>
            <div className="flex-1 bg-violet-600/20 rounded-t-sm h-3/4"></div>
            <div className="flex-1 bg-violet-600 rounded-t-sm h-full"></div>
            <div className="flex-1 bg-violet-600/20 rounded-t-sm h-5/6"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-3/4"></div>
          </div>
        </div>

        {/* Total Bookings Card */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-muted-foreground text-sm font-medium">Total Bookings</p>
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-medium" title="Sample data - awaiting backend integration">
                <TrendingUp className="size-3" />
                +10.4%
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalBookings.toLocaleString()}</h3>
          </div>
          <div className="mt-4 h-12 w-full flex items-end gap-1">
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-2/3"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/2"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-3/4"></div>
            <div className="flex-1 bg-violet-600 rounded-t-sm h-full"></div>
            <div className="flex-1 bg-violet-600/20 rounded-t-sm h-4/5"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-1/2"></div>
            <div className="flex-1 bg-violet-600/10 rounded-t-sm h-2/3"></div>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue vs Bookings Chart */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-border rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">Revenue vs. Bookings</h2>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-wide">Sample Data</span>
            </div>
            <p className="text-sm text-muted-foreground">Monthly performance analytics overview</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-600"></div>
              <span className="text-xs font-medium text-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400"></div>
              <span className="text-xs font-medium text-foreground">Bookings</span>
            </div>
            <select className="bg-muted border-none rounded-lg text-xs font-bold py-1.5 px-3 focus:ring-violet-600/20 text-foreground">
              <option>Last 12 Months</option>
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>
        <div className="relative h-[350px] w-full">
          {/* Static SVG Chart from design - KEEPING STATIC FOR NOW */}
          <svg className="w-full h-full" viewBox="0 0 1000 350" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2"></stop>
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line stroke="#e4e4e7" strokeDasharray="4" x1="0" x2="1000" y1="70" y2="70" className="dark:stroke-zinc-800"></line>
            <line stroke="#e4e4e7" strokeDasharray="4" x1="0" x2="1000" y1="140" y2="140" className="dark:stroke-zinc-800"></line>
            <line stroke="#e4e4e7" strokeDasharray="4" x1="0" x2="1000" y1="210" y2="210" className="dark:stroke-zinc-800"></line>
            <line stroke="#e4e4e7" strokeDasharray="4" x1="0" x2="1000" y1="280" y2="280" className="dark:stroke-zinc-800"></line>
            {/* Bookings Line (Secondary) */}
            <path d="M0,280 Q100,260 200,220 T400,200 T600,240 T800,180 T1000,140" fill="none" stroke="#94a3b8" strokeWidth="3"></path>
            {/* Revenue Area & Line (Primary) */}
            <path d="M0,350 L0,220 Q100,200 200,150 T400,120 T600,180 T800,100 T1000,60 L1000,350 Z" fill="url(#areaGradient)"></path>
            <path d="M0,220 Q100,200 200,150 T400,120 T600,180 T800,100 T1000,60" fill="none" stroke="#7c3aed" strokeLinecap="round" strokeWidth="4"></path>
            {/* X-axis Labels */}
            <text className="text-[10px] fill-muted-foreground font-medium" x="0" y="340">Jan</text>
            <text className="text-[10px] fill-muted-foreground font-medium" x="166" y="340">Mar</text>
            <text className="text-[10px] fill-muted-foreground font-medium" x="333" y="340">May</text>
            <text className="text-[10px] fill-muted-foreground font-medium" x="500" y="340">Jul</text>
            <text className="text-[10px] fill-muted-foreground font-medium" x="666" y="340">Sep</text>
            <text className="text-[10px] fill-muted-foreground font-medium" x="833" y="340">Nov</text>
            <text className="text-[10px] fill-muted-foreground font-medium" x="960" y="340">Dec</text>
          </svg>

          {/* Interaction Tooltip Mock */}
          <div className="absolute top-[10%] left-[80%] bg-card border border-border rounded-lg p-3 shadow-xl pointer-events-none">
            <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">November 2023</p>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-xs text-muted-foreground">Revenue</span>
                <span className="text-xs font-bold text-foreground">$4,820</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-xs text-muted-foreground">Bookings</span>
                <span className="text-xs font-bold text-foreground">342</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Recent Activity Feed (66% Column) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded uppercase tracking-wide">Sample Data</span>
            </div>
            <button className="text-violet-600 text-xs font-bold hover:underline">View All Activity</button>
          </div>
          <div className="divide-y divide-border">
            {/* Activity Item 1 */}
            <div className="px-6 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer group">
              <Image
                alt="Student"
                className="w-10 h-10 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAITYWC9OnjPASjLQcEi-JQfyxKfUSHEaBZ63CnVAFttimATj_D0FMpWhSmLbXgKP17jS7zs8d4aTbDIJMnvhqfc_CyT_TEB5sBjrvNbNnuPJyUWM75w1V5cPryblmTpq-QZwb5NY2rswwB8NtMZ0U9ohNsVQSObW-z3lj7h9rXjXYIHuL_qtM-jN77VdXTe_Bn_nG9LkHmRWIU8Raz9WiVnl_sSnoUcWrILKOXYR6SBIPdSN1pQNxFdc0E9I5rrQDfVrSmvJ1sykCd"
                width={40}
                height={40}
              />
              <div className="flex-grow">
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="font-bold text-foreground">Sarah J.</span> booked a <span className="text-violet-600 font-bold">Math session</span> with Dr. Aris.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">2 minutes ago</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
            </div>

            {/* Activity Item 2 */}
            <div className="px-6 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <UserPlus className="size-5" />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-muted-foreground">
                  New tutor application received from <span className="font-bold text-foreground">Marcus Webb</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">15 minutes ago</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
            </div>

            {/* Activity Item 3 */}
            <div className="px-6 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer group">
              <Image
                alt="Student"
                className="w-10 h-10 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIGgGHMbO4Judt5LzrFp0LKWHUONlvPkz6LKBXS01UQfd8NfOAXZJhv8gP73dBzeIiHDbGDJzFWiqaZVAwW40y-rNouqmd-AAOBf8yoEB9PjFYEZCm74s3_5ioJS-z_o_vOFJhx7H7oBLhOsDM-yQZY2P-ig9JrHLW_KgkKkGJT7nlUJVAJxloRRxI2JQN6nfPEuKZD6H-Bn-YghlqHgNF3hKNcvLKN3wnEJd_Jfwf8nroMBlhHzjST-jPHKC274agHcP5LD3r2HMT"
                width={40}
                height={40}
              />
              <div className="flex-grow">
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="font-bold text-foreground">James Wilson</span> completed <span className="text-violet-600 font-bold">Physics Quiz #4</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">1 hour ago</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
            </div>

            {/* Activity Item 4 */}
            <div className="px-6 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <CreditCard className="size-5" />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-muted-foreground">
                  Withdrawal request of <span className="font-bold text-foreground">$1,200</span> processed for Tutor Elena.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">3 hours ago</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Top Categories (33% Column) */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-foreground">Top Course Categories</h2>
            <BarChart3 className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-6">
            {topSubjects.length > 0 ? (
              topSubjects.slice(0, 4).map((subject) => {
                const total = topSubjects.reduce((acc, curr) => acc + curr.bookingCount, 0);
                const percentage = total > 0 ? Math.round((subject.bookingCount / total) * 100) : 0;

                return (
                  <div key={subject.categoryId}>
                    <div className="flex justify-between text-sm mb-2 text-foreground">
                      <span className="font-medium">{subject.categoryName}</span>
                      <span className="font-bold">{percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-600"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted-foreground py-4">No data available</p>
            )}
          </div>
          <div className="mt-10 p-4 bg-violet-600/5 dark:bg-violet-600/10 rounded-xl border border-violet-600/10">
            <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Growth Insight</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {topSubjects.length > 0
                ? `${topSubjects[0].categoryName} bookings are leading this month.`
                : "Check back later for growth insights."}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 text-muted-foreground text-xs flex flex-col md:flex-row justify-between items-center gap-4 border-t border-border">
        <p>© 2024 Lesprivate Learning Systems. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-violet-600 transition-colors">Help Center</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-violet-600 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
