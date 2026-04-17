import { Check, Zap, FileSpreadsheet, FileText, ChevronRight } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-600 tracking-tight">Foreshadow Leads</span>
            </div>
            <div>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2">Pricing</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2">See The Data</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl mb-6">
            Get to the homeowner <span className="text-blue-600">before anyone else.</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
            Stop waiting days for nationwide aggregators to update. We scrape local county foreclosure notices the day they are filed and deliver them directly to your inbox and CRM.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="#pricing" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition">
              View Pricing <ChevronRight className="ml-2 -mr-1 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50" id="demo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Built for speed and action</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Instant Daily Alerts</h3>
              <p className="mt-2 text-gray-500">The moment a notice hits the county, it hits your phone. Be the first to knock or text.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">CRM-Ready CSVs</h3>
              <p className="mt-2 text-gray-500">No data entry. Just drag and drop our CSV file straight into kvCORE, Follow Up Boss, or your dialer.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Weekly PDF Briefings</h3>
              <p className="mt-2 text-gray-500">A clean, beautifully formatted weekly summary PDF perfect for reviewing your weekend targets.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Transparency Section */}
      <div className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                No fluff. Just the raw data you need to close the deal.
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Most lead providers sell you outdated lists that have been picked over for weeks. We deploy custom legal-notice scrapers directly targeting county courthouse filings and local newspaper legals in Virginia.
              </p>
              <div className="mt-8 border-l-4 border-blue-600 pl-4">
                <p className="text-base text-gray-700 italic">
                  "If you are waiting for a property to show up on Zillow or PropStream, you are already 5 days too late."
                </p>
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 bg-gray-800 border-b border-gray-700 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="ml-4 text-xs font-mono text-gray-400">foreclosure_export_sample.csv</span>
                </div>
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">Every record includes:</h4>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 shrink-0 mr-3" />
                      <div>
                        <span className="text-gray-300 font-medium">Full Property Address</span>
                        <span className="block text-sm text-gray-500 font-mono mt-1">e.g., 13307 Queensgate Rd, Midlothian, VA 23114</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 shrink-0 mr-3" />
                      <div>
                        <span className="text-gray-300 font-medium">Financials (Principal & Deposit)</span>
                        <span className="block text-sm text-gray-500 font-mono mt-1">e.g., Principal: $441,849.00 | Req. Deposit: $44,184.90</span>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-400 shrink-0 mr-3" />
                      <div>
                        <span className="text-gray-300 font-medium">Exact Auction Logistics</span>
                        <span className="block text-sm text-gray-500 font-mono mt-1">e.g., 05/07/2026 12:30 PM at Chesterfield Circuit Court</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-24 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-xl text-gray-500">Invest in leads that actually convert.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Weekly Tier */}
            <div className="border border-gray-200 rounded-2xl shadow-sm p-8 bg-white flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Weekly Recap</h3>
              <p className="text-gray-500 mb-6">For casual agents and weekend investors.</p>
              <div className="text-5xl font-extrabold text-gray-900 mb-6">
                $149<span className="text-xl font-medium text-gray-500">/mo</span>
              </div>
              <ul className="space-y-4 flex-1 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                  <span className="text-gray-600">Delivered every Friday morning</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                  <span className="text-gray-600">Ready-to-import CSV file</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                  <span className="text-gray-600">Formatted PDF summary</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                  <span className="text-gray-600">Full county coverage</span>
                </li>
              </ul>
              <a href="#" className="w-full block text-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition">
                Subscribe Weekly
              </a>
            </div>

            {/* Daily Tier */}
            <div className="border-2 border-blue-600 rounded-2xl shadow-xl p-8 bg-white relative flex flex-col">
              <div className="absolute top-0 right-6 transform -translate-y-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Daily Immediate Alerts</h3>
              <p className="text-gray-500 mb-6">For serious wholesalers who need speed.</p>
              <div className="text-5xl font-extrabold text-gray-900 mb-6">
                $499<span className="text-xl font-medium text-gray-500">/mo</span>
              </div>
              <ul className="space-y-4 flex-1 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                  <span className="text-gray-600"><strong>Instant alerts</strong> when a property drops</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                  <span className="text-gray-600">CRM-Ready CSV files attached daily</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                  <span className="text-gray-600">Everything in the Weekly tier</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>
              <a href="#" className="w-full block text-center px-6 py-3 border border-transparent text-white bg-blue-600 font-medium rounded-md hover:bg-blue-700 transition shadow-sm">
                Subscribe Daily
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2026 Foreshadow Leads. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;