import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/">
              <div className="text-primary text-2xl font-bold cursor-pointer">Metal Cards NYC <span className="text-muted-foreground text-sm">Digital</span></div>
            </Link>
            <p className="text-muted-foreground text-base">The premium digital upgrade for your Metal Cards NYC business cards.</p>

          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase">Product</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/templates">
                      <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer">Templates</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => {
                      const element = document.getElementById('features');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }} className="text-base text-muted-foreground hover:text-foreground cursor-pointer">
                      Features
                    </button>
                  </li>
                  <li>
                    <button onClick={() => window.open('#')} className="text-base text-muted-foreground hover:text-foreground cursor-pointer">
                      Pricing
                    </button>
                  </li>
                  <li>
                    <button onClick={() => window.open('#')} className="text-base text-muted-foreground hover:text-foreground cursor-pointer">
                      Resources
                    </button>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/help">
                      <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer">Help Center</span>
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:nyccustomcardsin24hrs@gmail.com" className="text-base text-muted-foreground hover:text-foreground cursor-pointer">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <Link href="/faq">
                      <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer">FAQs</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={() => window.open('#')} className="text-base text-muted-foreground hover:text-foreground cursor-pointer">
                      Privacy Policy
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/about">
                      <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer">About</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/order">
                      <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer">Order Cards</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/reviews">
                      <span className="text-base text-muted-foreground hover:text-foreground cursor-pointer">Reviews</span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider uppercase">Subscribe</h3>
                <p className="mt-4 text-base text-muted-foreground">Get the latest updates and offers.</p>
                <form className="mt-4 sm:flex sm:max-w-md">
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    type="email"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    required
                    className="appearance-none min-w-0 w-full bg-background border border-border py-2 px-4 text-base rounded-md placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Enter your email"
                  />
                  <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="w-full bg-primary flex items-center justify-center border border-transparent rounded-md py-2 px-4 text-base font-medium text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-base text-muted-foreground xl:text-center">&copy; {new Date().getFullYear()} CardConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
