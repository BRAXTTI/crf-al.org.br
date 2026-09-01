import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro não tratado na aplicação:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-crfal-gray-50 px-4">
          <div className="bg-white rounded-2xl border border-crfal-gray-200 p-8 sm:p-12 max-w-lg text-center shadow-card">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-3">Algo deu errado</h1>
            <p className="text-crfal-gray-500 mb-8">
              Ocorreu um erro inesperado ao exibir esta página. Tente novamente ou
              volte para a página inicial.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Tentar novamente
              </button>
              <a href="/" className="btn-outline inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
                Página inicial
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
