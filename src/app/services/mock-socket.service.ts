import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockSocketService {
  private rooms: Map<string, any> = new Map();
  private userRooms: Map<string, string> = new Map();
  private lastEndCallTime = 0; // Throttle end-call events

  // Simulate socket events
  private eventSubjects = {
    connect: new Subject<void>(),
    disconnect: new Subject<void>(),
    'user-joined': new Subject<any>(),
    'user-left': new Subject<any>(),
    offer: new Subject<any>(),
    answer: new Subject<any>(),
    'ice-candidate': new Subject<any>(),
    'incoming-call': new Subject<any>(),
    'call-ended': new Subject<any>(),
  };

  private connected = new BehaviorSubject<boolean>(false);
  public connected$ = this.connected.asObservable();

  // Current user simulation
  public auth: { userId?: string } = {};

  constructor() {
    // Simulate connection after a short delay
    setTimeout(() => {
      this.connected.next(true);
      this.emit('connect');
    }, 1000);
  }

  connect() {
    if (!this.connected.value) {
      setTimeout(() => {
        this.connected.next(true);
        this.emit('connect');
      }, 500);
    }
  }

  disconnect() {
    this.connected.next(false);
    this.emit('disconnect');
  }

  get connected_value() {
    return this.connected.value;
  }

  on(event: string, callback: (data?: any) => void) {
    if (this.eventSubjects[event as keyof typeof this.eventSubjects]) {
      this.eventSubjects[event as keyof typeof this.eventSubjects].subscribe(
        callback
      );
    }
  }

  emit(event: string, data?: any) {
    // Reduce console spam for frequently called events
    const quietEvents = ['end-call'];
    if (!quietEvents.includes(event)) {
      console.log(`Mock Socket: Emitting ${event}`, data);
    } else {
      console.log(`Mock Socket: Emitting ${event}`);
    }

    switch (event) {
      case 'create-room':
        this.handleCreateRoom(data);
        break;
      case 'join-room':
        this.handleJoinRoom(data);
        break;
      case 'offer':
        this.handleOffer(data);
        break;
      case 'answer':
        this.handleAnswer(data);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(data);
        break;
      case 'end-call':
        this.handleEndCall();
        break;
      default:
        // Just emit the event for listeners
        if (this.eventSubjects[event as keyof typeof this.eventSubjects]) {
          this.eventSubjects[event as keyof typeof this.eventSubjects].next(
            data
          );
        }
        break;
    }
  }

  private handleCreateRoom(data: any) {
    const { roomId, taskId, userName, userId } = data;

    const room = {
      id: roomId,
      taskId,
      createdBy: userName,
      participants: [{ id: userId, name: userName }],
      isActive: true,
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    this.userRooms.set(userId, roomId);

    console.log(`Mock Socket: Room ${roomId} created by ${userName}`);

    // Simulate notifying other users about the new call
    // In a real implementation, this would notify all project members
    setTimeout(() => {
      this.simulateIncomingCall(room);
    }, 2000);
  }

  private handleJoinRoom(data: any) {
    const { roomId, userName, userId } = data;

    const room = this.rooms.get(roomId);
    if (room) {
      // Check if user is already in the room
      const existingParticipant = room.participants.find(
        (p: any) => p.id === userId
      );
      if (!existingParticipant) {
        room.participants.push({ id: userId, name: userName });
        this.userRooms.set(userId, roomId);

        console.log(
          `Mock Socket: User ${userName} joined room ${roomId}. Total participants: ${room.participants.length}`
        );

        // Notify ALL participants (including the one who just joined) about the new participant
        room.participants.forEach((participant: any) => {
          setTimeout(() => {
            this.eventSubjects['user-joined'].next({
              userId: userId,
              userName: userName,
              roomParticipants: room.participants,
            });
          }, 100);
        });
      } else {
        console.log(`Mock Socket: User ${userName} already in room ${roomId}`);
      }
    } else {
      console.error(`Mock Socket: Room ${roomId} not found`);
    }
  }

  private handleOffer(data: any) {
    const { to, offer } = data;
    console.log(`Mock Socket: Relaying offer to ${to}`);

    // In a real implementation, this would send to the specific user
    setTimeout(() => {
      this.eventSubjects['offer'].next({
        from: this.auth.userId,
        offer: offer,
      });
    }, 100);
  }

  private handleAnswer(data: any) {
    const { to, answer } = data;
    console.log(`Mock Socket: Relaying answer to ${to}`);

    setTimeout(() => {
      this.eventSubjects['answer'].next({
        from: this.auth.userId,
        answer: answer,
      });
    }, 100);
  }

  private handleIceCandidate(data: any) {
    const { to, candidate } = data;
    console.log(`Mock Socket: Relaying ICE candidate to ${to}`);

    setTimeout(() => {
      this.eventSubjects['ice-candidate'].next({
        from: this.auth.userId,
        candidate: candidate,
      });
    }, 50);
  }

  private handleEndCall() {
    const now = Date.now();
    // Throttle end-call events to prevent spam (minimum 1 second between calls)
    if (now - this.lastEndCallTime < 1000) {
      console.log('Mock Socket: Throttling end-call event');
      return;
    }
    this.lastEndCallTime = now;

    const roomId = this.userRooms.get(this.auth.userId || '');
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room && room.isActive) {
        console.log(`Mock Socket: Ending call for room ${roomId}`);
        room.isActive = false;

        // Notify all participants ONCE
        room.participants.forEach((participant: any) => {
          this.eventSubjects['call-ended'].next({});
        });

        // Clean up
        room.participants.forEach((participant: any) => {
          this.userRooms.delete(participant.id);
        });
        this.rooms.delete(roomId);
      } else {
        console.log('Mock Socket: Room already ended or not found');
      }
    }
  }

  private simulateIncomingCall(room: any) {
    // Simulate another user receiving an incoming call notification
    // In a real app, this would be sent to all project members
    console.log('Mock Socket: Simulating incoming call for other users');

    // You can uncomment this to test incoming call UI
    // setTimeout(() => {
    //   this.eventSubjects['incoming-call'].next(room);
    // }, 3000);
  }
}
