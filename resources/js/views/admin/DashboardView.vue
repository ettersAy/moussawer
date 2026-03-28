<template>
    <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome to the Moussawer management area.</p>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Users</h3>
                <p>150</p>
            </div>
            <div class="stat-card">
                <h3>Photographers</h3>
                <p>45</p>
            </div>
            <div class="stat-card">
                <h3>Total Bookings</h3>
                <p>320</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
}
.stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
