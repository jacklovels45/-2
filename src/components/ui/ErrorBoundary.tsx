import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-signal-rose mb-4">
            <AlertTriangle size={28} />
          </div>
          <h3 className="display text-lg font-semibold text-ink-800">页面出现错误</h3>
          <p className="text-sm text-ink-500 mt-1 max-w-sm">
            {this.state.error?.message || "发生了未知错误，请尝试刷新页面"}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <RefreshCw size={15} /> 重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}