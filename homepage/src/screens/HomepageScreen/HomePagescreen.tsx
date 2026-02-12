import { useState, useEffect } from "react";
import { Homepage } from "../../components/Homepage";

export const HomepageScreen = (): JSX.Element => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const testimonials = [
    { name: "Sari Lestari", location: "Yogyakarta", text: "Anak saya biasanya cepat bosan kalau belajar. Di Lesprivate.id, kami bisa diskusi dulu dengan gurunya di pertemuan pertama. Setelah itu baru ambil paket. Gurunya komunikatif dan bisa menyesuaikan cara mengajar dengan karakter anak." },
    { name: "Dimas Pratama", location: "Bandung, Jawa Barat", text: "Sebagai mahasiswa, saya butuh les yang fleksibel tapi tetap serius. Sistem paket di Lesprivate.id bikin saya lebih disiplin belajar. Gurunya kompeten dan enak diajak diskusi, bukan cuma ngajarin tapi juga ngajak mikir." },
    { name: "Yuliana Hartono", location: "Surabaya, Jawa Timur", text: "Yang paling saya apresiasi adalah transparansi. Dari awal sudah jelas profil guru, jadwal, dan sistem belajarnya. Pertemuan perdana sangat membantu kami sebagai orang tua untuk memastikan guru benar-benar sesuai dengan kebutuhan anak." },
    { name: "Budi Santoso", location: "Jakarta Selatan", text: "Saya sangat terbantu dengan sistem paket di Lesprivate.id. Jadwal teratur dan guru yang datang sangat profesional. Anak saya yang tadinya kesulitan di matematika sekarang sudah mulai mengerti dan nilai ujiannya meningkat." },
    { name: "Rina Wijaya", location: "Tangerang", text: "Pelayanan sangat memuaskan! Guru les yang datang tepat waktu dan metode mengajarnya mudah dipahami anak. Sistem pembayaran juga transparan dan aman. Highly recommended untuk orang tua yang mencari guru les berkualitas." },
    { name: "Ahmad Fauzi", location: "Depok", text: "Pertemuan perdana sangat membantu untuk mengenal karakter guru. Anak saya langsung cocok dengan cara mengajar yang interaktif dan menyenangkan. Sekarang dia lebih semangat belajar." },
    { name: "Dewi Kusuma", location: "Bekasi", text: "Sebagai ibu bekerja, saya sangat terbantu dengan fleksibilitas jadwal di Lesprivate.id. Guru bisa menyesuaikan dengan waktu kami dan hasilnya sangat memuaskan. Anak saya jadi lebih percaya diri di sekolah." },
    { name: "Hendra Gunawan", location: "Bogor", text: "Guru les yang disediakan benar-benar berkualitas dan sudah terverifikasi. Saya merasa aman dan nyaman menggunakan layanan ini. Progress belajar anak juga terpantau dengan baik melalui laporan dari guru." },
    { name: "Siti Nurhaliza", location: "Jakarta Timur", text: "Anak saya yang kelas 5 SD tadinya tidak suka belajar. Tapi sejak ikut les privat di Lesprivate.id, dia jadi lebih enjoy. Gurunya sabar dan bisa membuat suasana belajar jadi menyenangkan." },
    { name: "Rudi Hermawan", location: "Jakarta Barat", text: "Sistem paket yang ditawarkan sangat efisien. Tidak perlu repot-repot cari guru setiap minggu. Sekali booking untuk beberapa pertemuan, jadwal sudah fix dan guru yang sama terus yang datang. Konsisten dan berkualitas!" },
    { name: "Linda Permata", location: "Tangerang Selatan", text: "Harga yang ditawarkan sangat reasonable untuk kualitas guru yang diberikan. Anak saya belajar bahasa Inggris dengan guru yang native-like dan metodenya sangat engaging. Worth every penny!" },
    { name: "Eko Prasetyo", location: "Jakarta Pusat", text: "Aplikasinya user-friendly dan customer service sangat responsif. Ketika ada kendala jadwal, langsung dibantu dengan solusi terbaik. Pelayanan yang benar-benar customer-centric!" }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 3) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 3 + testimonials.length) % testimonials.length);
  };

  const visibleTestimonials = [
    testimonials[currentTestimonial],
    testimonials[(currentTestimonial + 1) % testimonials.length],
    testimonials[(currentTestimonial + 2) % testimonials.length]
  ];

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-white overflow-x-hidden w-full min-h-screen relative">
      {/* Banner */}
      <img className="w-full h-12 sm:h-16 md:h-20 lg:h-[104px] object-cover" alt="Banner" src="/images/cdn/banner1.png" />

      {/* Navigation */}
      <div className="w-full bg-[#7000fe] shadow-[0px_4px_24px_#0000004c] px-2 sm:px-4 md:px-8 lg:px-16 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
<<<<<<< HEAD
          <a href="https://app.lesprivate.id" target="_blank" rel="noopener noreferrer">
            <img className="h-8 sm:h-10 md:h-14 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" alt="Lesprivat logo" src="/images/cdn/lesprivat-logo-svg-1.svg" />
          </a>
=======
          <img className="h-8 sm:h-10 md:h-14 flex-shrink-0" alt="Lesprivat logo" src="/images/cdn/lesprivat-logo-svg-1.svg" />
>>>>>>> 1a19ced (chore: update service folders from local)
          
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            <button 
              onClick={() => scrollToSection('hero')}
              className="font-['Lato'] font-extrabold text-white text-xl hover:text-[#fecb00] transition-colors duration-300 cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('why-choose')}
              className="font-['Lato'] font-extrabold text-white text-xl hover:text-[#fecb00] transition-colors duration-300 cursor-pointer"
            >
              Mengapa Lesprivate?
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="font-['Lato'] font-extrabold text-white text-xl hover:text-[#fecb00] transition-colors duration-300 cursor-pointer"
            >
              How It Works?
            </button>
            <button 
              onClick={() => scrollToSection('teachers')}
              className="font-['Lato'] font-extrabold text-white text-xl hover:text-[#fecb00] transition-colors duration-300 cursor-pointer"
            >
              Guru Les
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="font-['Lato'] font-extrabold text-white text-xl hover:text-[#fecb00] transition-colors duration-300 cursor-pointer"
            >
              Testimoni
            </button>
          </div>

          <div className="flex gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            <a href="https://app.lesprivate.id/signup" target="_blank" rel="noopener noreferrer">
              <Homepage className="!h-8 sm:!h-10 md:!h-12 !w-20 xs:!w-24 sm:!w-28 md:!w-[148px] !relative !left-0 !top-0" hasBookingButton={false} homepage="btn" text="Daftar jadi Guru" />
            </a>
            <a href="https://app.lesprivate.id/signup" target="_blank" rel="noopener noreferrer">
              <Homepage className="!h-8 sm:!h-10 md:!h-12 !w-20 xs:!w-24 sm:!w-28 md:!w-[148px] !relative !left-0 !top-0" hasBookingButton={false} homepage="btnyellow" text="Daftar jadi Murid" />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <header id="hero" className="w-full bg-[#6372ff] py-8 md:py-12 lg:py-16 px-4 md:px-8 lg:px-16 relative overflow-hidden min-h-[300px] md:min-h-[380px] lg:min-h-[440px]">
        <img className="absolute top-0 left-0 w-full h-full object-cover opacity-50" alt="Background" src="/images/cdn/no-sketch-2-1.png" />
        
        {/* Decorative Elements */}
        <img className="absolute top-[20px] sm:top-[38px] right-[15px] sm:right-[30px] w-[150px] sm:w-[250px] lg:w-[422px] h-[100px] sm:h-[160px] lg:h-[270px] opacity-70 lg:opacity-100" alt="Element PNG" src="/images/cdn/10328682-png-1.png" />
        <img className="absolute top-[180px] sm:top-[250px] lg:top-[299px] left-[20px] sm:left-[60px] lg:left-[101px] w-[80px] sm:w-[130px] lg:w-[209px] h-[55px] sm:h-[90px] lg:h-[141px] opacity-70 lg:opacity-100" alt="Element" src="/images/cdn/7f676c46-4cfd-4859-bb32-efdc6e377490-png-1.png" />
        <img className="absolute top-[0px] right-[120px] sm:right-[250px] lg:right-[400px] w-[60px] sm:w-[90px] lg:w-[130px] h-[60px] sm:h-[90px] lg:h-32 opacity-70 lg:opacity-100" alt="Subtract" src="/images/cdn/subtract.png" />
        <img className="absolute top-[100px] sm:top-[140px] lg:top-[182px] left-[50px] sm:left-[120px] lg:left-[190px] w-[50px] sm:w-[70px] lg:w-28 h-[40px] sm:h-[55px] lg:h-[76px] opacity-70 lg:opacity-100" alt="Element PNG 2" src="/images/cdn/9825095-png-2.png" />
        <img className="absolute top-[140px] sm:top-[180px] lg:top-[223px] right-[40px] sm:right-[90px] lg:right-[150px] w-[50px] sm:w-[70px] lg:w-[98px] h-[48px] sm:h-[65px] lg:h-[93px] opacity-70 lg:opacity-100" alt="Element PNG 3" src="/images/cdn/9825095-png-3.png" />
        
        <div className="relative z-10 max-w-[1728px] mx-auto px-4 lg:px-0">
          <div className="lg:absolute lg:left-[290px] lg:top-[1px] lg:w-[600px]">
            <div className="font-['Lato'] font-extrabold text-white text-2xl md:text-4xl tracking-[0] leading-9 mb-2 md:mb-4">
              Temukan
            </div>
            <h1 className="font-['Lato'] font-extrabold text-white text-3xl md:text-[64px] tracking-[0] leading-tight md:leading-[64px] mb-2 md:mb-4">
              Guru Les Terbaik
            </h1>
            <div className="font-['Lato'] font-extrabold text-white text-xl md:text-4xl tracking-[0] leading-9 mb-4 md:mb-8">
              di Sekitar Anda
            </div>
            <p className="font-['Lato'] font-medium text-white text-sm md:text-xl tracking-[0] leading-[20px] md:leading-[24.6px]">
              Lesprivate membantu Anda menemukan guru les profesional sesuai kebutuhan anak — dari TK hingga SMA, semua mata pelajaran, langsung dari rumah Anda.
            </p>
          </div>
          
          {/* Student Image - positioned on the right */}
          <div className="hidden lg:block absolute right-[5px] top-[1px] w-[659px] h-[425px]">
            <img className="w-full h-full object-cover" alt="Students" src="/images/cdn/two-asian-kids.png" />
          </div>
        </div>
      </header>

      {/* CTA Box - Centered at bottom of hero */}
      <div className="relative w-full flex justify-center -mt-16 md:-mt-20 z-30 px-4">
        <a 
          href="https://wa.me/6285121909540" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full max-w-[580px] h-[132px] flex bg-white rounded-[32px] overflow-hidden border-2 border-solid border-[#00000040] shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-[#7000fe]"
        >
          <Homepage
            className="!border-[unset] !mt-3 !left-[unset] !ml-3 ![position:unset] !bg-[#7000fe] !w-[calc(100%-24px)] !top-[unset]"
            divClassName="!text-white"
            homepage="btnframe"
            text="KONSULTASI SEKARANG"
          />
        </a>
      </div>

      {/* Slider Image */}
      <div className="relative w-full flex justify-center py-8 md:py-12">
        <img
          className="w-full max-w-[1080px] h-auto px-4"
          alt="Slider"
          src="/images/cdn/slider.png"
        />
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="font-['Lato'] font-extrabold text-[#333333] text-3xl md:text-4xl lg:text-5xl mb-6">
              Belajar Lebih Fokus,<br />Tanpa Ribet dan Bisa dicoba dulu
            </h2>
            <p className="font-['Lato'] font-medium text-black text-lg md:text-xl mb-4">
              Guru datang ke rumah, dipesan dalam paket pertemuan, dan bisa mulai dari pertemuan perdana untuk memastikan kecocokan
            </p>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <div className="flex gap-4 items-start">
              <img className="w-12 h-12 md:w-16 md:h-16" alt="Calendar" src="/images/cdn/famicons-calendar.svg" />
              <div>
                <h3 className="font-['Lato'] font-extrabold text-[#333333] text-xl md:text-2xl lg:text-[32px] mb-2">Coba Pertemuan Perdana</h3>
                <p className="font-['Lato'] font-medium text-black text-base md:text-lg lg:text-xl">Kenali gaya mengajar guru sebelum lanjut ke paket</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <img className="w-12 h-12 md:w-16 md:h-16" alt="Box" src="/images/cdn/solar-box-bold.svg" />
              <div>
                <h3 className="font-['Lato'] font-extrabold text-[#333333] text-xl md:text-2xl lg:text-[32px] mb-2">Pesan Paket Sekaligus</h3>
                <p className="font-['Lato'] font-medium text-black text-base md:text-lg lg:text-xl">Jadwal lebih rapi, Progress anak lebih terpantau</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <img className="w-12 h-12 md:w-16 md:h-16" alt="Location" src="/images/cdn/typcn-location.svg" />
              <div>
                <h3 className="font-['Lato'] font-extrabold text-[#333333] text-xl md:text-2xl lg:text-[32px] mb-2">Fokus Jabodetabek</h3>
                <p className="font-['Lato'] font-medium text-black text-base md:text-lg lg:text-xl">Guru lokal, respons lebih cepat, dan koordinasi lebih mudah.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Why Choose Section */}
      <section id="why-choose" className="w-full bg-[#fecb00] py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Lato'] font-extrabold text-[#333333] text-2xl md:text-3xl lg:text-[32px] mb-2">Kenapa Orang Tua Mulai</h2>
            <h2 className="font-['Lato'] font-extrabold text-[#333333] text-3xl md:text-4xl lg:text-5xl">Memilih Lesprivate?</h2>
          </div>
          <img className="w-full max-w-9xl h-auto object-contain" alt="How it works" src="/images/why-choose.png" />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="font-['Lato'] font-extrabold text-[#333333] text-3xl md:text-4xl lg:text-5xl mb-4">CARA KERJA LESPRIVATE.ID</h2>
          <p className="font-['Lato'] font-extrabold text-[#333333] text-xl md:text-2xl lg:text-[32px]">4 Step simple, tanpa ribet</p>
        </div>
        <div className="flex justify-center items-center">
          <img className="w-full max-w-9xl h-auto object-contain" alt="How it works" src="/images/howitworks.png" />
        </div>
      </section>

      {/* Teachers Section */}
      <section id="teachers" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="font-['Lato'] font-extrabold text-[#333333] text-3xl md:text-4xl lg:text-5xl mb-4">GURU LES TERVERIFIKASI</h2>
          <p className="font-['Lato'] font-extrabold text-[#333333] text-2xl md:text-3xl lg:text-4xl">Siap Membantu Anak Anda</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "Reviani Wijaya Lasi Poen", subject: "Matematika", level: "Tingkat TK dan SD", img: "/images/cdn/teacher-1.png" },
            { name: "Putra Apriyanto Habirun", subject: "Bahasa Inggris", level: "Semua tingkat pendidikan", img: "/images/cdn/teacher-2.png" },
            { name: "Diva Aulia Aldasuqi", subject: "Matematika", level: "Tingkat TK, SD, SMP, MI, dan MTs", img: "/images/cdn/teacher-3.png" },
            { name: "Febriani Tambun", subject: "Matematika, IPA, dan Bahasa Indonesia", level: "Tingkat SD, SMP, dan SMA", img: "/images/cdn/teacher-4.png" },
            { name: "Pasrah Nazara", subject: "Matematika dan Informatika", level: "Tingkat TK dan SD", img: "/images/cdn/teacher-5.png" },
            { name: "Livia Grace Tandi", subject: "B. Inggris, B. Indonesia, Math, and Science", level: "Tingkat SD, SMP, SMA, dan SMK", img: "/images/cdn/teacher-6.png" }
          ].map((teacher, idx) => (
            <div key={idx} className="bg-white rounded-[40px] overflow-hidden shadow-lg">
              <img className="w-full h-64 md:h-80 object-cover" alt={teacher.name} src={teacher.img} />
              <div className="p-6 bg-white">
                <h3 className="font-['Lato'] font-extrabold text-[#333333] text-xl md:text-2xl mb-2">{teacher.name}</h3>
                <p className="font-['Lato'] font-medium text-[#333333] text-sm mb-2">{teacher.subject}</p>
                <p className="font-['Lato'] font-medium text-[#333333] text-sm">{teacher.level}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="w-full bg-[#373737] py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Lato'] font-extrabold text-white text-3xl md:text-4xl lg:text-5xl mb-4">TESTIMONI</h2>
            <p className="font-['Lato'] font-medium text-white text-xl">Apa Kata Mereka Tentang Kami</p>
          </div>
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white hover:bg-[#7000fe] text-[#7000fe] hover:text-white rounded-full p-3 md:p-4 shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Previous testimonials"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTestimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-neutral-800 rounded-2xl border-2 border-[#4d4d4d] p-6 transition-all duration-300 hover:border-[#7000fe] hover:shadow-xl hover:scale-105">
                  <h4 className="font-['Lato'] font-extrabold text-white text-xl md:text-2xl mb-1">{testimonial.name}</h4>
                  <p className="font-['Lato'] font-medium text-white text-sm mb-4">{testimonial.location}</p>
                  <p className="font-['Lato'] font-medium text-white text-sm leading-relaxed">{testimonial.text}</p>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white hover:bg-[#7000fe] text-[#7000fe] hover:text-white rounded-full p-3 md:p-4 shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Next testimonials"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx * 3)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentTestimonial / 3) === idx 
                    ? 'bg-[#7000fe] w-8' 
                    : 'bg-gray-500 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial set ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#6372ff] py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-['Lato'] font-bold text-white text-lg md:text-xl">©Lesprivate.id2025</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => scrollToSection('hero')}
          className="fixed bottom-8 right-8 bg-[#7000fe] hover:bg-[#fecb00] text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};
