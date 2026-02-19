import { useState, useEffect } from "react";
import { Homepage } from "../../components/Homepage";
import {
  Menu, X, Star, CheckCircle, MapPin, Calendar, Package,
  Users, ArrowRight, ChevronLeft, ChevronRight, Phone, Instagram,
  Clock, ShieldCheck, BadgeCheck
} from "lucide-react";

export const HomepageScreen = (): JSX.Element => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const testimonials = [
    { name: "Sari Lestari", location: "Yogyakarta", text: "Anak saya biasanya cepat bosan kalau belajar. Di Lesprivate.id, kami bisa diskusi dulu dengan gurunya di pertemuan pertama. Gurunya komunikatif dan bisa menyesuaikan cara mengajar." },
    { name: "Dimas Pratama", location: "Bandung, Jawa Barat", text: "Sistem paket di Lesprivate.id bikin saya lebih disiplin belajar. Gurunya kompeten dan enak diajak diskusi, bukan cuma ngajarin tapi juga ngajak mikir kritis." },
    { name: "Yuliana Hartono", location: "Surabaya, Jawa Timur", text: "Transparansi adalah kunci. Dari awal sudah jelas profil guru, jadwal, dan sistem belajarnya. Pertemuan perdana sangat membantu kami memastikan kecocokan." },
    { name: "Budi Santoso", location: "Jakarta Selatan", text: "Jadwal teratur dan guru profesional. Anak saya yang tadinya kesulitan matematika sekarang mulai mengerti dan nilai ujiannya meningkat signifikan." },
    { name: "Rina Wijaya", location: "Tangerang", text: "Guru datang tepat waktu, metode mudah dipahami. Sistem pembayaran transparan. Highly recommended untuk orang tua yang cari kualitas." },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-white min-h-screen relative font-['Lato']">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#7000FE] shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <img className="h-10 w-auto" src="/images/cdn/lesprivat-logo-svg-1.svg" alt="Lesprivate" />
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              {['Home', 'Mengapa Lesprivate?', 'How It Works?', 'Guru Les', 'Testimoni'].map((item, idx) => {
                const sectionIds = ['hero', 'why-choose', 'how-it-works', 'teachers', 'testimonials'];
                return (
                  <button
                    key={idx}
                    onClick={() => scrollToSection(sectionIds[idx])}
                    className="text-white font-bold hover:text-[#FECB00] transition-colors text-base"
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* CTA Buttons - Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <a href="https://app.lesprivate.my.id/signup" target="_blank" rel="noopener noreferrer">
                <Homepage variant="outline" size="sm" className="!border-white !text-white hover:!bg-white/10">
                  Daftar Guru
                </Homepage>
              </a>
              <a href="https://app.lesprivate.my.id/signup" target="_blank" rel="noopener noreferrer">
                <Homepage variant="secondary" size="sm" className="!text-[#3a0083] !font-black">
                  Daftar Murid
                </Homepage>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-[#FECB00] p-2"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#7000FE] absolute top-20 w-full shadow-xl border-t border-white/10">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {['Home', 'Mengapa Lesprivate?', 'How It Works?', 'Guru Les', 'Testimoni'].map((item, idx) => {
                const sectionIds = ['hero', 'why-choose', 'how-it-works', 'teachers', 'testimonials'];
                return (
                  <button
                    key={idx}
                    onClick={() => scrollToSection(sectionIds[idx])}
                    className="block w-full text-left px-3 py-3 text-white font-bold hover:bg-white/10 rounded-md"
                  >
                    {item}
                  </button>
                );
              })}
              <div className="pt-4 flex flex-col gap-3">
                <a href="https://app.lesprivate.my.id/signup" target="_blank" rel="noopener noreferrer" className="w-full">
                  <Homepage variant="outline" className="w-full justify-center !border-white !text-white">Daftar Guru</Homepage>
                </a>
                <a href="https://app.lesprivate.my.id/signup" target="_blank" rel="noopener noreferrer" className="w-full">
                  <Homepage variant="secondary" className="w-full justify-center">Daftar Murid</Homepage>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-28 pb-20 lg:pt-36 lg:pb-32 bg-gradient-to-br from-[#7000FE] to-[#5500CC] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FECB00]/20 rounded-full blur-3xl filter"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Hero Text */}
            <div className="text-center lg:text-left text-white space-y-6">
              <h1 className="font-['Gochi_Hand'] text-5xl lg:text-7xl leading-tight">
                Temukan Guru Les <br />
                <span className="text-[#FECB00]">Terbaik</span> di Sekitar Anda
              </h1>
              <p className="text-lg lg:text-xl text-white/90 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Platform les privat terpercaya untuk TK hingga SMA. Guru terverifikasi datang ke rumah, belajar jadi lebih fokus dan menyenangkan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <a href="https://app.lesprivate.my.id/signup" target="_blank" rel="noreferrer">
                  <Homepage variant="secondary" size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl">
                    Mulai Sekarang
                  </Homepage>
                </a>
                <a href="https://wa.me/6285121909540" target="_blank" rel="noreferrer">
                  <Homepage variant="outline" size="lg" className="w-full sm:w-auto !border-white hover:!bg-white hover:!text-[#7000FE]">
                    <Phone className="w-5 h-5 mr-2" />
                    Konsultasi WA
                  </Homepage>
                </a>
              </div>

              {/* Social Proof */}
              <div className="pt-8 flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-8 text-sm font-bold">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <BadgeCheck className="text-[#FECB00] w-5 h-5" /> 500+ Guru Terverifikasi
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Star className="text-[#FECB00] w-5 h-5 fill-current" /> Rating 4.9/5.0
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative z-10 w-full max-w-lg mx-auto lg:ml-auto">
                <img src="/images/cdn/two-asian-kids.png" alt="Happy Students" className="w-full drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" />
              </div>
              {/* Decorative floating elements could go here */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#FECB00]/20 rounded-full blur-2xl"></div>
              <h2 className="font-['Lato'] font-black text-4xl lg:text-5xl text-gray-900 leading-tight relative z-10">
                Belajar Lebih Fokus, <br />
                <span className="text-[#7000FE]">Tanpa Ribet</span>
              </h2>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed relative z-10">
                Lupakan macet di jalan. Guru kami datang ke rumah, jadwal fleksibel, dan progres anak terpantau setiap saat.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: <Calendar className="w-8 h-8 text-[#7000FE]" />,
                  title: "Coba Pertemuan Perdana",
                  desc: "Kenali gaya mengajar guru sebelum lanjut paket. Tidak cocok? Bisa ganti guru gratis."
                },
                {
                  icon: <Package className="w-8 h-8 text-[#7000FE]" />,
                  title: "Sistem Paket Hemat",
                  desc: "Lebih hemat dengan ambil paket belajar. Jadwal fix, administrasi rapi & transparan."
                },
                {
                  icon: <MapPin className="w-8 h-8 text-[#7000FE]" />,
                  title: "Fokus Jabodetabek",
                  desc: "Guru-guru lokal terbaik di Jakarta, Bogor, Depok, Tangerang, dan Bekasi."
                }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-6 p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-[#7000FE]/20 group">
                  <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-[#7000FE] transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Section (Yellow) */}
      <section id="why-choose" className="py-20 bg-[#FECB00]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Gochi_Hand'] text-5xl text-[#3a0083] mb-4">Kenapa Memilih Kami?</h2>
          <p className="text-[#3a0083] font-bold text-xl mb-12 opacity-80 max-w-2xl mx-auto">
            Ribuan orang tua di Jabodetabek mempercayakan pendidikan tambahan anaknya kepada Lesprivate.id
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck className="w-10 h-10 text-[#7000FE]" />, title: "Guru Terverifikasi", desc: "Seleksi ketat (tes tulis, wawancara, microteaching)." },
              { icon: <Clock className="w-10 h-10 text-[#7000FE]" />, title: "Jadwal Fleksibel", desc: "Atur jadwal belajar sesuai kebutuhan keluarga Anda." },
              { icon: <Users className="w-10 h-10 text-[#7000FE]" />, title: "Personal Approach", desc: "Metode belajar disesuaikan karakter unik setiap anak." },
              { icon: <BadgeCheck className="w-10 h-10 text-[#7000FE]" />, title: "Laporan Berkala", desc: "Progress report rutin setelah setiap sesi belajar." },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-lg hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 mx-auto bg-purple-50 rounded-full flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Lato'] font-black text-4xl mb-4 text-[#333]">Cara Kerja Simple</h2>
          <p className="text-xl text-gray-500 mb-16">Mulai belajar dalam 4 langkah mudah</p>

          <div className="relative">
            {/* Dashed Connector Line (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-0 w-full h-1 border-t-4 border-dashed border-[#7000FE]/20 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {[
                { step: "1", title: "Pilih Guru", desc: "Cari guru sesuai mapel & lokasi via website/WA." },
                { step: "2", title: "Jadwalkan", desc: "Tentukan waktu terbaik untuk pertemuan perdana." },
                { step: "3", title: "Uji Coba", desc: "Guru datang, anak belajar. Lihat kecocokannya." },
                { step: "4", title: "Lanjut Paket", desc: "Cocok? Langsung ambil paket belajar hemat." },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-[#7000FE] rounded-full flex items-center justify-center text-white text-3xl font-['Gochi_Hand'] shadow-lg border-4 border-white mb-6 transform hover:scale-110 transition-transform">
                    {step.step}
                  </div>
                  <h3 className="font-extrabold text-2xl text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section id="teachers" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-['Gochi_Hand'] text-5xl text-[#7000FE] mb-4">Guru Pilihan Kami</h2>
            <p className="text-xl text-gray-600">Siap membantu anak Anda meraih prestasi terbaik</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Reviani Wijaya", subject: "Matematika", level: "SD - SMP", img: "/images/cdn/teacher-1.png" },
              { name: "Putra Apriyanto", subject: "Bahasa Inggris", level: "All Levels", img: "/images/cdn/teacher-2.png" },
              { name: "Diva Aulia", subject: "Matematika & IPA", level: "SD - SMA", img: "/images/cdn/teacher-3.png" },
              // Additional dummy teachers if needed to fill grid
            ].map((teacher, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="relative h-64 overflow-hidden">
                  <img src={teacher.img} alt={teacher.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-600 flex items-center gap-1 shadow-sm">
                    <CheckCircle size={14} /> TERVERIFIKASI
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="font-extrabold text-2xl text-gray-900 mb-2">{teacher.name}</h3>
                  <div className="space-y-2">
                    <p className="text-[#7000FE] font-bold text-sm bg-purple-50 inline-block px-3 py-1 rounded-lg">{teacher.subject}</p>
                    <p className="text-gray-500 text-sm block">{teacher.level}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="https://app.lesprivate.my.id/signup" target="_blank" rel="noreferrer">
              <Homepage variant="outline" className="!border-[#7000FE] !text-[#7000FE] hover:!bg-[#7000FE] hover:!text-white">
                Lihat Semua Guru <ArrowRight className="ml-2 w-5 h-5" />
              </Homepage>
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-[#18181b] to-[#2d2d2d] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-['Lato'] font-black text-4xl mb-4 text-[#FECB00]">Kata Orang Tua</h2>
            <p className="text-xl text-gray-400">Pengalaman mereka belajar bersama Lesprivate.id</p>
          </div>

          <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md">

            <div className="text-center max-w-3xl mx-auto">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-[#FECB00] fill-current" />
                ))}
              </div>

              <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8 italic">
                "{testimonials[currentTestimonial].text}"
              </p>

              <div>
                <h4 className="font-bold text-xl text-white">{testimonials[currentTestimonial].name}</h4>
                <p className="text-[#FECB00] text-sm font-bold mt-1">{testimonials[currentTestimonial].location}</p>
              </div>
            </div>

            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#7000FE] p-3 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#7000FE] p-3 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${currentTestimonial === idx ? 'w-8 bg-[#FECB00]' : 'w-2 bg-gray-600'}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#7000FE] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <img src="/images/cdn/lesprivat-logo-svg-1.svg" alt="Logo" className="h-10 mb-6 brightness-0 invert" />
              <p className="text-white/80 max-w-sm leading-relaxed mb-6">
                Platform les privat terpercaya yang menghubungkan siswa dengan guru terbaik di Jabodetabek. Belajar nyaman, prestasi aman.
              </p>
              <div className="flex gap-4">
                <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-[#FECB00] hover:text-[#7000FE] transition-colors"><Instagram size={20} /></a>
                <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-[#FECB00] hover:text-[#7000FE] transition-colors"><Phone size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-[#FECB00]">Menu</h4>
              <ul className="space-y-3">
                {['Home', 'Tentang Kami', 'Cara Kerja', 'Daftar Guru', 'Daftar Murid'].map((item, i) => (
                  <li key={i}><a href="#" className="text-white/80 hover:text-white hover:pl-2 transition-all">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-[#FECB00]">Hubungi Kami</h4>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3"><MapPin size={18} className="mt-1 flex-shrink-0" /> Jakarta, Indonesia</li>
                <li className="flex items-center gap-3"><Phone size={18} /> +62 851-2190-9540</li>
                <li className="flex items-center gap-3"><Clock size={18} /> Senin - Jumat: 09.00 - 17.00</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
            &copy; 2025 Lesprivate.id. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Scroll To Top */}
      {showScrollTop && (
        <button
          onClick={() => scrollToSection('hero')}
          className="fixed bottom-8 right-8 bg-[#FECB00] hover:bg-white text-[#7000FE] p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

    </div>
  );
};

