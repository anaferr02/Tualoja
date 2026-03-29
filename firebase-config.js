rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function userEmail() {
      return request.auth.token.email;
    }

    function esParticipanteReserva() {
      return signedIn() && (
        resource.data.huespedId == request.auth.uid ||
        resource.data.anfitrionId == request.auth.uid ||
        resource.data.hostId == request.auth.uid ||
        resource.data.ownerId == request.auth.uid ||
        resource.data.huespedEmail == userEmail() ||
        resource.data.guestEmail == userEmail() ||
        resource.data.anfitrionEmail == userEmail() ||
        resource.data.hostEmail == userEmail() ||
        resource.data.ownerEmail == userEmail()
      );
    }

    function esParticipanteReservaNuevo() {
      return signedIn() && (
        request.resource.data.huespedId == request.auth.uid ||
        request.resource.data.anfitrionId == request.auth.uid ||
        request.resource.data.hostId == request.auth.uid ||
        request.resource.data.ownerId == request.auth.uid ||
        request.resource.data.huespedEmail == userEmail() ||
        request.resource.data.guestEmail == userEmail() ||
        request.resource.data.anfitrionEmail == userEmail() ||
        request.resource.data.hostEmail == userEmail() ||
        request.resource.data.ownerEmail == userEmail()
      );
    }

    match /alojamientos/{id} {
      allow read: if true;
      allow write: if signedIn();
    }

    match /reservas/{id} {
      allow create: if signedIn();
      allow read: if esParticipanteReserva();
      allow update: if esParticipanteReserva();
      allow delete: if false;

      match /mensajes/{mensajeId} {
        allow read: if esParticipanteReserva();

        allow create: if esParticipanteReserva()
          && request.resource.data.remitenteId == request.auth.uid;

        allow update, delete: if false;
      }
    }
  }
}
