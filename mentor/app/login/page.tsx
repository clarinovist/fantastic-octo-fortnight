import { LoginForm } from "@/components/login-form";
import { Quote } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full flex-row overflow-hidden bg-background">
            {/* Left Panel - Abstract Background & Testimonial */}
            <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600">
                {/* Abstract Pattern overlay */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_40%)] rotate-[30deg] pointer-events-none" />

                {/* Brand Logo */}
                <div className="relative z-10 flex items-center gap-3 text-white font-bold text-2xl tracking-tight">
                    <Image
                        src="/lesprivate-logo-notext.png"
                        alt="Lesprivate Logo"
                        width={40}
                        height={40}
                        className="object-contain brightness-0 invert"
                    />
                    Lesprivate
                </div>

                {/* Testimonial Card */}
                <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-lg shadow-2xl">
                        <div className="mb-6 text-white/80">
                            <Quote className="w-10 h-10 fill-current opacity-50" />
                        </div>
                        <blockquote className="space-y-6">
                            <p className="text-2xl font-medium leading-relaxed text-white">
                                &quot;Menjadi mentor di Lesprivate memberikan saya kebebasan untuk berbagi ilmu sekaligus mengelola penghasilan dengan sangat transparan dan mudah.&quot;
                            </p>
                            <footer className="flex items-center gap-4 border-t border-white/20 pt-6">
                                <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-white/40 shadow-sm bg-zinc-200">
                                    <Image
                                        src="https://lh3.googleusercontent.com/a/ACg8ocL_K_v6_w_R-u_v_w_f-v_w_f-v_w_f-v_w_f-v_w_f=s96-c"
                                        alt="Tutor Example"
                                        className="w-full h-full object-cover"
                                        width={48}
                                        height={48}
                                    />
                                </div>
                                <div>
                                    <div className="font-bold text-white text-lg">Budi Santoso</div>
                                    <div className="text-sm text-white/70">
                                        Bahasa Inggris Mentor
                                    </div>
                                </div>
                            </footer>
                        </blockquote>
                    </div>
                    {/* Pagination Indicators */}
                    <div className="mt-8 flex gap-2 opacity-50">
                        <div className="h-1.5 w-12 bg-white rounded-full transition-all" />
                        <div className="h-1.5 w-3 bg-white/40 rounded-full" />
                        <div className="h-1.5 w-3 bg-white/40 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex w-full lg:w-[55%] flex-col justify-center items-center bg-background px-6 py-12 md:px-12 lg:px-24">
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
                    <Image
                        src="/lesprivate-logo-notext.png"
                        alt="Lesprivate Logo"
                        width={36}
                        height={36}
                        className="object-contain"
                    />
                    Lesprivate
                </div>

                <div className="w-full max-w-[440px] flex flex-col gap-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            Portal Mentor
                        </h1>
                        <p className="text-muted-foreground text-base">
                            Kelola murid dan penghasilan Anda di satu tempat
                        </p>
                    </div>

                    <LoginForm />

                    <p className="text-center text-sm text-muted-foreground">
                        Belum bergabung sebagai mentor?{" "}
                        <a
                            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001'}/signup`}
                            className="font-bold text-violet-600 hover:text-violet-700 transition-colors"
                        >
                            Daftar Sekarang
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
