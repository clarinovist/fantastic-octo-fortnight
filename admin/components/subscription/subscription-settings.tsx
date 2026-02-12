"use client";

import {
  History,
  Save,
  Percent,
  DollarSign,
  Bot,
  Headphones,
  BarChart2,
  WifiOff,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { SubscriptionItem } from "@/utils/types";
import { updateSubscriptionPricesAction } from "@/actions/subscription";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SubscriptionSettingsProps {
  initialData: SubscriptionItem[];
}

export function SubscriptionSettings({ initialData }: SubscriptionSettingsProps) {
  const router = useRouter();
  const studentPremiumSubscription = initialData.find(
    (item) => item.name === "Student Premium" && item.interval === "monthly"
  );

  const [baseTutorCommission] = useState(15);
  const [studentPremium, setStudentPremium] = useState(
    studentPremiumSubscription ? Number(studentPremiumSubscription.price) : 9.99
  );
  const [yearlyDiscount] = useState(20);
  const [loading, setLoading] = useState(false);

  // Toggle states
  const [toggles, setToggles] = useState({
    ai: true,
    support: true,
    analytics: false,
    offline: false
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!studentPremiumSubscription) {
      toast.error("Student Premium subscription configuration not found in database.");
      return;
    }

    setLoading(true);
    try {
      const result = await updateSubscriptionPricesAction(
        studentPremiumSubscription.id,
        {
          name: studentPremiumSubscription.name,
          interval: studentPremiumSubscription.interval,
          price: studentPremium
        }
      );

      if (result.success) {
        toast.success("Student Premium price updated successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 font-sans text-slate-900 dark:text-white">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <Link className="text-slate-500 hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
          <ChevronRight className="size-4 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-medium">Subscription</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Subscription Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage platform rates, subscription plans, and premium feature availability.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-medium transition-colors">
              <History className="size-[18px]" />
              View Audit Log
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-md shadow-primary/20 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="size-[18px]" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Pricing Config Section */}
          <section className="bg-white dark:bg-[#1e1629] rounded-xl border border-zinc-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pricing Configuration</h2>
              <div className="flex gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium dark:bg-white/5 dark:text-slate-400">Global Rates</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card 1 */}
              <div className="col-span-1 border border-zinc-200 dark:border-slate-700 rounded-lg p-5 flex flex-col gap-4 hover:border-[#7c3bed]/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Percent className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      Base Tutor Commission
                      <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Coming Soon</span>
                    </h3>
                    <p className="text-xs text-slate-500">Platform fee per session (Read-only)</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-auto">
                  <div className="relative w-full">
                    <input
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-400 dark:text-white/40 bg-slate-50 dark:bg-white/5 cursor-not-allowed text-lg font-medium outline-none transition-all"
                      type="number"
                      value={baseTutorCommission}
                      disabled
                      readOnly
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="col-span-1 border border-zinc-200 dark:border-slate-700 rounded-lg p-5 flex flex-col gap-4 hover:border-[#7c3bed]/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Student Premium</h3>
                    <p className="text-xs text-slate-500">Monthly subscription fee</p>
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-auto">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                    <input
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-medium outline-none transition-all"
                      type="number"
                      value={studentPremium}
                      onChange={(e) => setStudentPremium(Number(e.target.value))}
                    />
                  </div>
                  <span className="text-sm text-slate-500 pb-2">/mo</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  Yearly Discount Rate
                  <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Coming Soon</span>
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary"
                    max="50"
                    min="0"
                    disabled
                    type="range"
                    value={yearlyDiscount}
                  />
                  <span className="text-sm font-bold text-slate-400 w-12 text-right">{yearlyDiscount}%</span>
                </div>
                <p className="text-xs text-slate-500">Applies to annual billing cycles automatically.</p>
              </div>
            </div>
          </section>

          {/* Recent Transactions Section */}
          <section className="bg-white dark:bg-[#1e1629] rounded-xl border border-zinc-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Recent Transactions
                <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Coming Soon</span>
              </h2>
              <Link className="text-xs font-medium text-slate-400 cursor-not-allowed" href="#">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">Oct 24, 2023</td>
                    <td className="px-6 py-3 text-sm font-mono text-slate-500">tx_1Nf8...92a</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">$9.99</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Succeeded</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">Oct 24, 2023</td>
                    <td className="px-6 py-3 text-sm font-mono text-slate-500">tx_1Nf7...b4x</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">$45.00</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Succeeded</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">Oct 23, 2023</td>
                    <td className="px-6 py-3 text-sm font-mono text-slate-500">tx_1Nf6...k9p</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">$99.00</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-slate-600 dark:text-slate-300">Oct 22, 2023</td>
                    <td className="px-6 py-3 text-sm font-mono text-slate-500">tx_1Nf5...m2q</td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-900 dark:text-white">$9.99</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Sidebar (1 Col) */}
        <div className="lg:col-span-1">
          <section className="bg-white dark:bg-[#1e1629] rounded-xl border border-zinc-200 dark:border-slate-800 shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Premium Features</h2>
              <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Coming Soon</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Control availability of premium features (Preview).</p>

            <div className="flex flex-col gap-6">
              <ToggleItem
                icon={<Bot className="size-5 text-primary" />}
                title="AI Matching"
                description="Smart tutor recommendations based on learning style."
                checked={toggles.ai}
                onChange={() => handleToggle("ai")}
              />
              <hr className="border-slate-100 dark:border-slate-800" />

              <ToggleItem
                icon={<Headphones className="size-5 text-rose-500" />}
                title="Priority Support"
                description="24/7 direct access to senior support agents."
                checked={toggles.support}
                onChange={() => handleToggle("support")}
              />
              <hr className="border-slate-100 dark:border-slate-800" />

              <ToggleItem
                icon={<BarChart2 className="size-5 text-blue-500" />}
                title="Advanced Analytics"
                description="Deep dive insights into student performance."
                checked={toggles.analytics}
                onChange={() => handleToggle("analytics")}
              />
              <hr className="border-slate-100 dark:border-slate-800" />

              <ToggleItem
                icon={<WifiOff className="size-5 text-amber-500" />}
                title="Offline Access"
                description="Download materials for offline viewing."
                checked={toggles.offline}
                onChange={() => handleToggle("offline")}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ icon, title, description, checked, onChange }: {
  icon: React.ReactNode,
  title: string,
  description: string,
  checked: boolean,
  onChange: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{title}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {/* Custom Switch using CSS/Tailwind */}
      <label className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in cursor-pointer">
        <input
          type="checkbox"
          name="toggle"
          className="peer absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 dark:border-slate-600 checked:bg-white transition-all duration-300 checked:right-0 checked:border-primary right-[calc(100%-1.25rem)]"
          checked={checked}
          onChange={onChange}
        />
        <span className="block overflow-hidden h-5 rounded-full bg-slate-300 dark:bg-slate-700 peer-checked:bg-primary transition-colors duration-300"></span>
      </label>
    </div>
  );
}
