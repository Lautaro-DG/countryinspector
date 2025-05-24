@extends('layouts.app')
@section('title', 'Country Inspector | Profile')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/user.css') }}">
@endsection
@section('contenido')
<div class="content">
    <div class="profile-container">
        <div class="profile-columns">
            <div class="user-info-column">
                <div class="user-details">
                    <h2 class="section-title">User Information</h2>
                    <div class="info-item borde-izquierdo-gradiente">
                        <span class="info-label">Name:</span>
                        <span class="info-value">{{ $user->name }}</span>
                    </div>
                    <div class="info-item borde-izquierdo-gradiente">
                        <span class="info-label">Email:</span>
                        <span class="info-value">{{ $user->email }}</span>
                    </div>
                </div>
            </div>

            <div class="countries-column">
                <h3 class="section-title">Recently Visited Countries</h3>
                <div class="countries-list">
                    @if($historial->isEmpty())
                    <p class="empty-message">No visited countries yet.</p>
                    @else
                    <ul class="visited-countries">
                        @foreach($historial as $item)
                        <li class="country-item">
                            <a href="{{ $item->pagina_visitada }}" class="country-link">
                                {{ \Illuminate\Support\Str::headline(last(explode('/', $item->pagina_visitada))) }}
                            </a>
                            <small class="visit-date">{{ $item->created_at->diffForHumans() }}</small>
                        </li>
                        @endforeach
                    </ul>
                    @endif
                </div>
            </div>
        </div>

        <div class="reviews-section">
            <h3 class="section-title">Last 5 Reviews</h3>
            <div class="reviews-container">
                @if($reviews->isEmpty())
                <p class="empty-message">No reviews yet.</p>
                @else
                <div class="reviews-list">
                    @foreach($reviews as $review)
                    <div class="review-item">
                        <p class="review-text">{{ $review->review }}</p>
                        <small class="review-date">{{ $review->created_at->diffForHumans() }}</small>
                    </div>
                    @endforeach
                </div>
                @endif
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn btn-edit">Edit Profile</button>
            <button class="btn btn-delete">Delete Profile</button>
        </div>
    </div>
</div>
<div id="editModal" class="modal hidden">
    <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Edit Profile</h2>
        <form method="POST" action="{{ route('profile.update') }}" id="editProfileForm">
            @csrf
            @method('PUT')

            <label for="name">Name:</label>
            <input type="text" id="name" name="name" value="{{ $user->name }}" required>

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="{{ $user->email }}" required>

            <label for="password">New Password:</label>
            <input type="password" id="password" name="password" placeholder="Min. 8 chars, 1 uppercase, 1 number" minlength="8">

            <label for="password_confirmation">Confirm Password:</label>
            <input type="password" id="password_confirmation" name="password_confirmation" placeholder="Repeat new password">

            <div id="password-error" style="color: red; font-size: 0.9rem; display: none; margin-top: 0.5rem;"></div>

            <button type="submit" class="btn">Save Changes</button>
        </form>

    </div>
</div>
<div id="deleteModal" class="modal hidden">
    <div class="modal-content delete-modal-content">
        <span class="close-btn delete-close-btn">&times;</span>
        <h2>Delete Profile</h2>
        <p class="delete-message">Are you sure you want to delete your profile? This action cannot be undone.</p>
        
        <div class="delete-buttons">
            <button type="button" class="btn btn-cancel">Cancel</button>
            <form method="POST" action="{{ route('profile.destroy') }}" style="display: inline;">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-confirm-delete">Yes, Delete</button>
            </form>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script>
    const editBtn = document.querySelector('.btn-edit');
    const modal = document.getElementById('editModal');
    const closeBtn = modal.querySelector('.close-btn');
    const form = document.getElementById('editProfileForm');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password_confirmation');
    const passwordError = document.getElementById('password-error');

    editBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    form.addEventListener('submit', function(e) {
        if (password.value !== '' || passwordConfirm.value !== '') {
            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            if (!regex.test(password.value)) {
                e.preventDefault();
                passwordError.style.display = 'block';
                passwordError.textContent = 'Password must have at least 8 characters, one uppercase letter, one number, and one special character.';
                return;
            }

            if (password.value !== passwordConfirm.value) {
                e.preventDefault();
                passwordError.style.display = 'block';
                passwordError.textContent = 'Passwords do not match.';
                return;
            }

            passwordError.style.display = 'none';
        }
    });
</script>
<script>
// Delete modal functionality (agregar después del código existente)
const deleteBtn = document.querySelector('.btn-delete');
const deleteModal = document.getElementById('deleteModal');
const deleteCloseBtn = deleteModal.querySelector('.close-btn');
const cancelBtn = deleteModal.querySelector('.btn-cancel');

deleteBtn.addEventListener('click', () => {
    deleteModal.classList.remove('hidden');
});

deleteCloseBtn.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
});

cancelBtn.addEventListener('click', () => {
    deleteModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        deleteModal.classList.add('hidden');
    }
});
</script>
@endsection
