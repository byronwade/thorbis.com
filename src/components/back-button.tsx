'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
	className?: string;
	children?: React.ReactNode;
}

export default function BackButton({ className, children }: BackButtonProps) {
	const handleGoBack = () => {
		if (window.history.length > 1) {
			window.history.back();
		} else {
			// Fallback to home page if there's no history
			window.location.href = '/';
		}
	};

	return (
		<Button 
			onClick={handleGoBack}
			variant="outline"
			size="sm"
			className={className}
		>
			<ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
			{children || 'Go Back'}
		</Button>
	);
}