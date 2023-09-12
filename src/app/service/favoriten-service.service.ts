import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  constructor(private firestore: Firestore) { }

  async addToFavorites(userId: string, chatId: string) {
    try {
      const userFavoritesRef = doc(this.firestore, 'favoritelist', userId);
      const userFavoritesSnapshot = await getDoc(userFavoritesRef);

      if (userFavoritesSnapshot.exists()) {
        const userFavoritesData = userFavoritesSnapshot.data();
        const chatIds = userFavoritesData['chatIds'] || [];

        // Überprüfen Sie, ob die maximale Anzahl von Chats (3) erreicht ist
        if (chatIds.length < 3 && !chatIds.includes(chatId)) {
          chatIds.push(chatId);
          await updateDoc(userFavoritesRef, { chatIds });
          console.log('Chat zur Favoritenliste hinzugefügt.');
        } else {
          console.error('Maximale Anzahl von Chats in der Favoritenliste erreicht.');
        }
      } else {
        // Wenn keine Favoritenliste existiert, erstellen Sie eine neue mit dem aktuellen Chat
        await setDoc(userFavoritesRef, { chatIds: [chatId] });
        console.log('Favoritenliste für Benutzer erstellt und Chat hinzugefügt.');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Chats zur Favoritenliste:', error);
    }
  }

  // entfernt einen Chat aus der Favoritenliste eines Benutzers in einer Firestore-Datenbank
  async removeFavorites(userId: string, chatId: string) {
    try {
      const userFavoritesRef = doc(this.firestore, 'favoritelist', userId);
      const userFavoritesSnapshot = await getDoc(userFavoritesRef);
      if (userFavoritesSnapshot.exists()) {
        const chatIds = this.loadChatIds(userFavoritesSnapshot);
        const index = chatIds.indexOf(chatId);
        if (index !== -1) {
          await this.removeChatFavorites(userFavoritesRef, chatIds, index);
        }
      }
    } catch (error) {
      this.handleRemoveFromFavoritesError(error);
    }
  }

  //extrahiert die favoriteiste der Chat-IDs und entfernt den angegebenen Chat aus dieser Liste
  async removeChatFavorites(userFavoritesRef: any, chatIds: string[], index: number) {
    chatIds.splice(index, 1);
    await updateDoc(userFavoritesRef, { chatIds });
    console.log('Chat aus der Favoritenliste entfernt.');
  }

  //fehler meldung beim entfernen des chat
  handleRemoveFromFavoritesError(error: any) {
    console.error('Fehler beim Entfernen des Chats aus der Favoritenliste:', error);
  }

  // läd die chatId aus snapchot
  loadChatIds(snapshot: any): string[] {
    const userFavoritesData = snapshot.data();
    return userFavoritesData['chatIds'] || [];
  }

  // überprüft, ob ein bestimmter Chat in der Favoritenliste eines Benutzers in einer Firestore-Datenbank vorhanden ist
  async ChatFavorites(userId: string, chatId: string): Promise<boolean> {
    try {
      const userFavoritesRef = doc(this.firestore, 'favoritelist', userId);
      const userFavoritesSnapshot = await getDoc(userFavoritesRef);
      if (userFavoritesSnapshot.exists()) {
        const chatIds = this. loadChatIds(userFavoritesSnapshot);
        return this.checkChatFavorites(chatIds, chatId);
      }
      return false;
    } catch (error) {
      this.handleIsChatInFavoritesError(error);
      return false;
    }
  }

  //prüft ob eine bestimmte ChatIds in einer Liste von ChatIds vorhanden ist
  checkChatFavorites(chatIds: string[], chatId: string): boolean {
    return chatIds.includes(chatId);
  }

  //fehler meldung
  handleIsChatInFavoritesError(error: any) {
    console.error('Fehler beim Überprüfen, ob der Chat in den Favoriten ist:', error);
  }
}
