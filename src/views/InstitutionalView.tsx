import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ShieldCheck, FileText, ArrowLeft, ExternalLink, HelpCircle } from 'lucide-react';

interface InstitutionalViewProps {
  type: 'terms' | 'privacy' | 'affiliate';
}

export const InstitutionalView: React.FC<InstitutionalViewProps> = ({ type }) => {
  const { settings, navigate } = useStore();

  const titles = {
    terms: 'Termos de Uso',
    privacy: 'Política de Privacidade',
    affiliate: 'Divulgação de Afiliado e Transparência'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate('/')}
        className="text-xs font-semibold text-slate-500 hover:text-purple-600 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar para o Início</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            {type === 'affiliate' ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <FileText className="w-6 h-6" />
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {titles[type]}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Última atualização: Outubro de 2026 • {settings.store_name}
            </p>
          </div>
        </div>

        {type === 'affiliate' && (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. O que é o nosso site?</h2>
            <p>
              O <strong>{settings.store_name}</strong> é uma plataforma independente de curadoria e recomendação de produtos em alta no TikTok Shop. Nós não somos o TikTok Shop nem uma loja oficial proprietária da plataforma ByteDance/TikTok.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. Como funcionam os links de afiliados?</h2>
            <p>
              Ao navegar pela nossa vitrine e clicar no botão "Comprar no TikTok Shop" ou "Ver no TikTok Shop", você é direcionado com segurança diretamente para o vendedor e anúncio oficial dentro do aplicativo ou site do TikTok Shop.
            </p>
            <p>
              Esse redirecionamento utiliza um <strong>link de afiliado credenciado</strong>. Caso você decida adquirir o produto indicado, nós poderemos receber uma pequena comissão do marketplace ou vendedor parceiro.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Há custos extras para você?</h2>
            <p className="p-4 rounded-xl bg-purple-50 border border-purple-100 font-semibold text-purple-900">
              Absolutamente não! O preço do produto que você paga é rigorosamente o mesmo anunciado no TikTok Shop. Todas as promoções, cupons de primeira compra e ofertas relâmpago continuam plenamente válidas.
            </p>

            <h2 className="text-base font-bold text-slate-900">4. Pagamentos, Entrega e Garantia</h2>
            <p>
              O <strong>{settings.store_name}</strong> não processa pagamentos, não armazena dados de cartão de crédito e não realiza o envio de encomendas. Todas as etapas de pagamento, rastreamento de frete, devolução e garantia são asseguradas diretamente pelo TikTok Shop e seus vendedores regulamentados.
            </p>
          </div>
        )}

        {type === 'privacy' && (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Coleta Mínima de Dados e LGPD</h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018), coletamos apenas as informações estritamente necessárias para o funcionamento do site e métricas de navegação.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. Dados de Rastreamento de Cliques</h2>
            <p>
              Quando você clica em um link de recomendação, registramos apenas identificadores anônimos de navegação (como data, hora e página de origem) para entender quais produtos despertam maior interesse em nossa audiência. Não coletamos nem armazenamos CPFs, endereços ou dados pessoais identificáveis de visitantes.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Cookies e Redirecionamentos</h2>
            <p>
              Ao ser direcionado para o TikTok Shop, as políticas de privacidade e cookies da referida plataforma passam a vigorar para a finalização segura da compra.
            </p>

            <h2 className="text-base font-bold text-slate-900">4. Contato do Encarregado de Dados</h2>
            <p>
              Dúvidas ou solicitações relativas à privacidade podem ser encaminhadas diretamente ao e-mail institucional: <strong>{settings.contact_email}</strong>.
            </p>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Aceitação dos Termos</h2>
            <p>
              Ao utilizar este site, você concorda com estes termos de uso. O objetivo da vitrine é estritamente informativo e de indicação de achadinhos do e-commerce.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. Preços e Disponibilidade de Estoque</h2>
            <p>
              Embora busquemos manter as informações sempre alinhadas com o catálogo do TikTok Shop, valores promocionais, estoques e taxas de frete estão sujeitos a alterações dinâmicas e repentinas determinadas pelos lojistas do TikTok Shop sem aviso prévio. Prevalece sempre o valor final exibido na página de checkout oficial do TikTok.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Propriedade Intelectual</h2>
            <p>
              TikTok e TikTok Shop são marcas registradas de seus respectivos detentores. O uso de tais termos destina-se unicamente à identificação dos canais onde os produtos podem ser adquiridos pelos usuários.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
