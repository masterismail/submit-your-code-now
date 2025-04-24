
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Info, AlertTriangle, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const Notifications: React.FC = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useData();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  
  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "read") return notification.read;
    if (filter === "unread") return !notification.read;
    return true;
  });
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const handleReadNotification = (id: string) => {
    markNotificationAsRead(id);
    
    toast({
      title: "Notification marked as read",
      description: "This notification has been marked as read.",
    });
  };
  
  const handleClearAll = () => {
    clearAllNotifications();
    
    toast({
      title: "Notifications cleared",
      description: "All notifications have been cleared.",
    });
  };
  
  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
            {filter === "all" && notifications.length > 0 && (
              <span className="ml-2 bg-expense-primary/20 text-expense-primary px-2 py-0.5 rounded-full text-xs">
                {notifications.length}
              </span>
            )}
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-2 bg-expense-primary/20 text-expense-primary px-2 py-0.5 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button
            variant={filter === "read" ? "default" : "outline"}
            onClick={() => setFilter("read")}
          >
            Read
          </Button>
        </div>
      </div>
      
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="bg-background p-2 rounded-full">
                      {getIcon(notification.type)}
                    </div>
                    <div>
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(notification.date), "PPP")}
                      </p>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => handleReadNotification(notification.id)}
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Mark as Read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-background p-3 mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-1">No Notifications</h3>
            <p className="text-center text-muted-foreground">
              {filter === "all" 
                ? "You don't have any notifications yet." 
                : filter === "unread" 
                  ? "You don't have any unread notifications." 
                  : "You don't have any read notifications."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
