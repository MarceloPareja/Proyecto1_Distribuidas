import { defineStore } from 'pinia'
import { ref } from 'vue'
import socketService from '@/services/socket'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const users = ref([])
  const connected = ref(false)
  const currentUser = ref(null)
  const currentRoomId = ref(null)

  function initializeSocket() {
    socketService.removeAllListeners()

    socketService.onRoomJoined((data) => {
      connected.value = true
      messages.value = data.history || []
    })

    socketService.onNewMessage((data) => {
      messages.value.push(data)
    })

    socketService.onUserJoined((data) => {
      messages.value.push({
        type: 'system',
        content: `${data.nickname} se unió a la sala`,
        timestamp: new Date().toISOString()
      })
    })

    socketService.onUserLeft((data) => {
      messages.value.push({
        type: 'system',
        content: `${data.nickname} salió de la sala`,
        timestamp: new Date().toISOString()
      })
    })

    socketService.onUserList((data) => {
      users.value = data.users || []
    })

    socketService.onError((data) => {
      console.error('❌ Socket error:', data)
    })
  }

  function joinRoom(roomId, pin, nickname) {
    currentUser.value = { nickname }
    currentRoomId.value = roomId
    socketService.connect()
    socketService.joinRoom(roomId, pin, nickname)
  }

  function sendMessage(content) {
    if (content.trim()) {
      socketService.sendMessage(content)
    }
  }

  function leaveRoom() {
    socketService.leaveRoom()
    socketService.disconnect()
    connected.value = false
    messages.value = []
    users.value = []
    currentUser.value = null
    currentRoomId.value = null
  }

  // FIX 3: addFileMessage eliminada del flujo de upload.
  // El mensaje de archivo llega por socket (new_message broadcast)
  // igual que para todos los demás usuarios, evitando duplicados.
  // onNewMessage() en initializeSocket() lo agrega automáticamente.

  return {
    messages,
    users,
    connected,
    currentUser,
    currentRoomId,
    initializeSocket,
    joinRoom,
    sendMessage,
    leaveRoom
  }
})