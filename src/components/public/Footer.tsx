import { GraduationCap, Mail, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">B.Tech Notes</h3>
                <p className="text-xs text-gray-400">Hub</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Your one-stop destination for B.Tech study materials. 
              Access notes organized by branch, year, and semester.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/" className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="/search" className="hover:text-white transition-colors">Search Notes</a>
              </li>
              <li>
                <a href="/admin/login" className="hover:text-white transition-colors">Admin Login</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@btechnotes.com</span>
              </li>
              <li className="flex items-center space-x-4 mt-4">
                <a href="#" className="hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} B.Tech Notes Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
