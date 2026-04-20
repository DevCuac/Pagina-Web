import prisma from './db';
import { type User } from '@prisma/client';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

// Notify when someone replies to a forum post
export async function notifyPostReply(post: { id: string; title: string; authorId: string }, replierId: string, replierName: string) {
  if (post.authorId === replierId) return; // Don't notify self
  await createNotification(
    post.authorId,
    'forum_reply',
    'Nueva respuesta en tu post',
    `${replierName} respondió a "${post.title}"`,
    `/forums/post/${post.id}`
  );
}

// Notify when ticket status changes
export async function notifyTicketUpdate(ticket: { id: string; subject: string; authorId: string }, status: string) {
  await createNotification(
    ticket.authorId,
    'ticket_update',
    'Actualización de ticket',
    `Tu ticket "${ticket.subject}" fue marcado como ${status}`,
    `/support/${ticket.id}`
  );
}

// Notify when a ticket gets a new message
export async function notifyTicketMessage(ticket: { id: string; subject: string; authorId: string }, senderId: string, senderName: string) {
  if (ticket.authorId === senderId) return;
  await createNotification(
    ticket.authorId,
    'ticket_message',
    'Nuevo mensaje en tu ticket',
    `${senderName} respondió a "${ticket.subject}"`,
    `/support/${ticket.id}`
  );
}

// Notify staff and admins when a new ticket is created
export async function notifyStaffNewTicket(ticket: { id: string; subject: string; authorId: string }, authorName: string) {
  const staffUsers = await prisma.user.findMany({
    where: {
      role: {
        OR: [{ isStaff: true }, { isAdmin: true }],
      },
    },
    select: { id: true },
  });

  const notifications = staffUsers.map((staff) => ({
    userId: staff.id,
    type: 'new_ticket',
    title: 'Nuevo Ticket',
    message: `${authorName} creó el ticket: "${ticket.subject}"`,
    link: `/support/${ticket.id}`,
  }));

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications,
    });
  }
}

