/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UserCheck, Shield, FileText, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-2 rounded-lg">
              <UserCheck size={24} />
            </div>
            <h1 className="text-2xl font-bold text-black">GINFO</h1>
          </div>
          <Link 
            href="/login"
            className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-full transition-colors flex items-center gap-2"
          >
            Connexion
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900 md:text-5xl">
                Gestion d'Informations<br />
                <span className="text-black">Employés</span>
              </h2>
              <p className="text-lg text-gray-600">
                Plateforme intuitive pour la gestion complète des informations de vos employés. 
                Simplifiez vos processus RH et améliorez la productivité.
              </p>
              <div className="pt-4">
                <Link 
                  href="/login"
                  className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  Commencer maintenant
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-md">
                <Image
                  src="/api/placeholder/480/360"
                  alt="Interface GINFO"
                  width={480}
                  height={360}
                  className="rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Caractéristiques principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="bg-gray-200 text-black p-3 rounded-lg inline-block mb-4">
                <UserCheck size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestion simplifiée</h3>
              <p className="text-gray-600">
                Interface intuitive pour gérer toutes les informations de vos employés en un seul endroit.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="bg-gray-200 text-black p-3 rounded-lg inline-block mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sécurité des données</h3>
              <p className="text-gray-600">
                Protection avancée des informations sensibles conforme aux normes de sécurité.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="bg-gray-200 text-black p-3 rounded-lg inline-block mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Documents intégrés</h3>
              <p className="text-gray-600">
                Gestion des documents et des notifications importantes pour vos employés.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Rejoignez les entreprises qui optimisent leur gestion d'employés avec GINFO.
          </p>
          <Link 
            href="/login"
            className="bg-white text-black hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            Connexion
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-gray-800 p-2 rounded-lg">
                <UserCheck size={20} />
              </div>
              <span className="text-xl font-bold">GINFO</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} GINFO. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}