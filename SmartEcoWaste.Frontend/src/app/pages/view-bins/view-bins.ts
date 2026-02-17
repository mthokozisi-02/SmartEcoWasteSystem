import { BinService } from '@/core/services/bin.service';
import { Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
    selector: 'app-view-bins',
    imports: [],
    templateUrl: './view-bins.html',
    styleUrl: './view-bins.scss'
})
export class ViewBins {
    map!: L.Map;

    constructor(private binService: BinService) {}

    ngAfterViewInit(): void {
        this.map = L.map('map').setView([0, 0], 2); // temporary default

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        this.setUserLocation();

        this.map.on('click', (e: L.LeafletMouseEvent) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            console.log('Latitude:', lat);
            console.log('Longitude:', lng);

            this.binService.reverseGeocode(lat, lng).subscribe((res) => {
                const address = res.display_name;
                console.log(address);

                L.popup().setLatLng([lat, lng]).setContent(address).openOn(this.map);
            });
        });
    }

    setUserLocation() {
        if (!navigator.geolocation) {
            alert('Geolocation not supported by your browser');
            return;
        }

        const trashIcon = L.divIcon({
            html: `<i class="fa-solid fa-trash" style="color: rgba(50, 209, 30, 1); font-size: 20px;"></i>`,
            className: '', // important: removes default icon styles
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const fullTrashIcon = L.divIcon({
            html: `<i class="fa-solid fa-trash" style="color: rgba(209, 30, 30, 1.00);"></i>`,
            className: '', // important: removes default icon styles
            iconSize: [40, 40],
            iconAnchor: [10, 10]
        });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Center map to user
                this.map.setView([lat, lng], 15);

                // Add marker for user
                L.marker([lat, lng]).addTo(this.map).bindPopup('You are here').openPopup();
                L.marker([-20.183832109884403, 28.604149818420414], { icon: fullTrashIcon }).addTo(this.map).bindPopup('You are not here').openPopup();
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Please allow location access');
            }
        );
    }
}
