import { useEffect, useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, X } from 'lucide-react';

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  const { data: user } = useQuery<any>({
    queryKey: ['/api/auth/user'],
  });

  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    subscribe 
  } = usePushNotifications();

  useEffect(() => {
    if (!user || !isSupported || dismissed) return;
    
    // Check if we should show the prompt
    if (permission === 'default' && !isSubscribed) {
      // Delay showing prompt to not be intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    // Auto-subscribe if permission already granted but not subscribed
    if (permission === 'granted' && !isSubscribed) {
      subscribe();
    }
  }, [user, isSupported, isSubscribed, permission, dismissed, subscribe]);

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem('push-prompt-dismissed', 'true');
  };

  // Don't show if already subscribed, not supported, or previously dismissed
  if (!showPrompt || !isSupported || isSubscribed || permission === 'denied') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border rounded-lg shadow-lg p-4 z-50">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        data-testid="button-dismiss-push-prompt"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Alarm Notifications Enable करें
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            App बंद होने पर भी alarm और reminder notifications पाने के लिए enable करें
          </p>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleEnable}
              data-testid="button-enable-notifications"
            >
              <Bell className="h-4 w-4 mr-1" />
              Enable
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              data-testid="button-later-notifications"
            >
              बाद में
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
