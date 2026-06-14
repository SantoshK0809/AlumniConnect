import { useState, useEffect } from "react";
import "../index.css";
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  LockClosedIcon,
  UsersIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/AluminiLogo.png";
import { Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { Badge, badgeVariants } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import { ImageWithFallback } from "../components/ui/ImageWithFallBack";
import AlumniDirectory from "../assets/AlumniD.png";
import RTM from "../assets/RTM.png";
import NotificatIons from "../assets/OfficialNotice.png";
import RBA from "../assets/RBA.png";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/Button";


export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    alumni: 10000,
    students: 500,
    faculty: 50,
    satisfaction: 95
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const axios = (await import('axios')).default;
        const res = await axios.get('/api/public/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch public stats", err);
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      title: "Alumni Directory",
      description:
        "Connect with fellow graduates across all batches and departments",
      icon: UsersIcon,
      image: AlumniDirectory,
    },
    {
      title: "Real-time Messaging",
      description:
        "Stay connected with instant messaging and group discussions",
      icon: ChatBubbleLeftIcon,
      image: RTM, // chat app
    },
    {
      title: "Official Notifications",
      description:
        "Teachers can send official college notifications to students",
      icon: BellIcon,
      image: NotificatIons, // notification
    },
    {
      title: "Role-based Access",
      description:
        "Secure access for Students, Alumni, Teachers, and Administrators",
      icon: LockClosedIcon,
      image: RBA, // security
    },
  ];

  const benefits = [
    {
      icon: UsersIcon,
      title: "Build Your Network",
      description:
        "Connect with alumni across industries and unlock career opportunities",
    },
    {
      icon: MagnifyingGlassIcon,
      title: "Find Opportunities",
      description:
        "Discover internships, jobs, and mentorship through your alumni network",
    },
    {
      icon: BellIcon,
      title: "Stay Informed",
      description:
        "Get important updates and announcements directly from your institution",
    },
    {
      icon: ChatBubbleLeftIcon,
      title: "Real-time Communication",
      description:
        "Chat instantly with classmates, alumni, and faculty members",
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security",
    },
    {
      icon: AcademicCapIcon,
      title: "Career Growth",
      description: "Access mentorship and guidance from successful alumni",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navbar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6 lg:px-1">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <a href="#" className="flex items-center">
              <img src={logo} alt="Alumini Logo" className="h-13 w-auto" />
              {/* <AcademicCapIcon  className="h-8 w-8 text-indigo-600 ml-2" /> */}
              {/* <h2 className="ml-2 text-xl font-bold text-gray-900"> Alumini Connect</h2> */}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href="/Login"
              className="inline-block px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors duration-150"
            >
              Sign In
            </a>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full right-0 w-40 bg-white shadow-lg rounded-b-lg z-40">
            <div className="flex flex-col p-4 space-y-3">
              {/* Sign In / Login buttons */}
              <Link
                to={"/Login"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-indigo-600 font-medium text-center py-2 border rounded-md"
              >
                Sign In
              </Link>
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-indigo-600 font-medium text-center py-2 border rounded-md"
              >
                Login
              </a>

              {/* Optional Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 self-center"
              >
                Close ✕
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col lg:flex-row mt-2 relative mt-0 py-10 laege-px-16 lg:pl-15 lg:pr-15">
        {/* Left Side - Text */}
        <div className="lg:w-1/2 flex flex-col justify-center px-16 lg:px-16 py-12 ">
          <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full mb-2">
            🎓 Connect. Network. Grow.
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-gray-900 mb-3">
            Your College{" "}
            <span className="text-indigo-600">Community Connected</span>
          </h1>
          <p className="text-gray-700 text-lg sm:text-xl mb-8 max-w-lg">
            Join thousands of students, alumni, and faculty in building lasting
            connections that span generations and career paths.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={"/Login"}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <ScrollLink
              to="about"
              smooth={true}
              duration={500}
              offset={-70}
              className="px-5 py-3 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors duration-200 cursor-pointer"
            >
              Learn More
            </ScrollLink>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{(stats.alumni ?? 0).toLocaleString()}+</h3>
              <p className="text-gray-500 text-sm">Active Alumni</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{(stats.students ?? 0).toLocaleString()}+</h3>
              <p className="text-gray-500 text-sm">Students</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{(stats.faculty ?? 0).toLocaleString()}+</h3>
              <p className="text-gray-500 text-sm">Faculty Members</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{(stats.satisfaction ?? 0).toLocaleString()}%</h3>
              <p className="text-gray-500 text-sm">User Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Right Side - Image with notification cards */}
        <div className="lg:w-1/2 relative flex items-center justify-center px-6 lg:px-16 py-12">
          <img
            src="https://images.unsplash.com/photo-1608485439523-25b28d982428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBncmFkdWF0aW9ufGVufDF8fHx8MTc1OTM4Nzc5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Hero Illustration"
            className="w-[500] h-[300px] h-[500px] w-[500px] object-cover rounded-xl shadow-lg"
          />

          {/* Notification Cards */}
          <div className="absolute lg:top-18 top:35 right-6 bg-white p-4 rounded-lg shadow-md flex items-center gap-3 w-52 md:block hidden">
            <BellIcon className="h-6 w-6 text-indigo-600" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900">Official Notice</p>
              <p className="text-gray-500">From faculty</p>
            </div>
          </div>

          <div className="absolute lg:bottom-18 left-6 bg-white p-4 rounded-lg shadow-md flex items-center gap-3 w-52 md:block hidden">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900">5 new messages</p>
              <p className="text-gray-500">From alumni network</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-20 bg-background lg:pl-15 lg:pr-15 bg-gray-50"
      >
        <div className="container mx-auto px-6 lg:px-16">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-16">
            <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full mb-2">
              Features
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Everything you need to stay connected
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to bring your college community
              together
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Side - Feature Cards */}
            <div className="flex-1 space-y-6 w-full">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeFeature === index
                      ? "ring-2 ring-primary shadow-lg"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-lg ${
                          activeFeature === index
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground mb-2">
                          {feature.description}
                        </p>
                        {activeFeature === index && (
                          <p className="text-sm text-muted-foreground">
                            {feature.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Side - Dynamic Feature Image */}
            <div className="flex-1 relative w-full lg:w-[500px]">
              <div className="overflow-hidden rounded-xl shadow-lg">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeFeature}
                    src={features[activeFeature].image}
                    alt={features[activeFeature].title}
                    className="w-full h-[400px] lg:h-[500px] object-cover rounded-xl"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 bg-background lg:pl-23 lg:pr-23">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full mb-2">
              Why Choose AlumniConnect
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Built for your success
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="text-center border border-gray-200 rounded-xl bg-white hover:border-indigo-500 hover:shadow-md transition-all duration-300 "
              >
                <CardContent className="p-6 space-y-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="relative py-20 bg-background lg:pl-15 lg:pr-15 bg-gray-50"
      >
        <div className="container mx-auto px-6 lg:px-16 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="text-center space-y-4 mb-8">
              <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full mb-2">
                About Us
              </span>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-snug">
                Building Bridges Between Students, Alumni, and Faculty
              </h2>
            </div>
            <p className="text-gray-600 text-lg">
              Our Alumni Portal is designed to bring together students, alumni,
              and educators on one collaborative platform. Whether you're
              looking to reconnect, mentor, or explore new career opportunities
              — we make it simple and secure.
            </p>

            <p className="text-gray-600">
              With verified college-based registration and role-based access,
              everyone — from current students to alumni professionals — can
              engage meaningfully and contribute to a stronger academic network.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-background lg:pl-50 lg:pr-50">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center space-y-6 lg:pl-50 lg:pr-50">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to connect?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of students and alumni who are already building
              meaningful connections
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" className="group">
                <Link to={"/register"}>Get Started Now</Link>
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
