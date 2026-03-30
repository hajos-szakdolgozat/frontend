import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpClient } from "../../api/axios";
import "./css/NotificationsPage.css";

const formatDateTime = (value) => {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("hu-HU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const syncUnreadCount = (count) => {
    setUnreadCount(count);
    window.dispatchEvent(
      new CustomEvent("notifications:updated", {
        detail: { unreadCount: count },
      }),
    );
  };

  const loadNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await httpClient.get("/api/notifications");
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      syncUnreadCount(Number(data?.unread_count || 0));
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Nem sikerült betölteni az értesítéseket.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await httpClient.patch("/api/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
      syncUnreadCount(0);
    } catch {
      setError("Nem sikerült az összes értesítést olvasottnak jelölni.");
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification?.read_at) {
      try {
        const { data } = await httpClient.patch(`/api/notifications/${notification.id}/read`);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id
              ? { ...item, read_at: new Date().toISOString() }
              : item,
          ),
        );
        syncUnreadCount(Number(data?.unread_count ?? Math.max(unreadCount - 1, 0)));
      } catch {
        setError("Nem sikerült az értesítést olvasottnak jelölni.");
      }
    }

    if (notification?.action_url) {
      const frontendBase = window.location.origin;
      const normalizedUrl = notification.action_url.startsWith(frontendBase)
        ? notification.action_url.replace(frontendBase, "")
        : notification.action_url;
      navigate(normalizedUrl);
    }
  };

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read_at).length,
    [notifications],
  );

  return (
    <section className="notifications-page">
      <header className="notifications-page__header">
        <div>
          <h1>Értesítések</h1>
          <p>{notifications.length} értesítés, ebből {unreadNotifications} olvasatlan.</p>
        </div>
        <button
          type="button"
          className="notifications-page__mark-all"
          onClick={handleMarkAllRead}
          disabled={!unreadNotifications}
        >
          Mind olvasott
        </button>
      </header>

      {loading ? (
        <p className="notifications-page__status">Betöltés...</p>
      ) : error ? (
        <p className="notifications-page__status">{error}</p>
      ) : notifications.length ? (
        <div className="notifications-page__list">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notifications-page__item${notification.read_at ? "" : " is-unread"}`}
            >
              <div>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
                <span>{formatDateTime(notification.created_at)}</span>
              </div>

              {notification.action_url && (
                <button type="button" onClick={() => handleOpenNotification(notification)}>
                  {notification.action_label || "Megnyitás"}
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="notifications-page__status">Jelenleg nincs értesítésed.</p>
      )}
    </section>
  );
};

export default NotificationsPage;