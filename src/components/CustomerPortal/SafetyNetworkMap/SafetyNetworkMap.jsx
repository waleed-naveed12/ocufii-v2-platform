import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styled from "styled-components";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Toast from "../../../utility/CustomerPortal/Toast";
import {
  MapContainer,
  MapWrapper,
  MapHeader,
  CloseButton,
} from "../../../styles/CustomerPortal/SafetyNetworkMap.styled";

// Mapbox access token
mapboxgl.accessToken = window.REACT_APP_MAP_BOX_API_KEY;

const SafetyNetworkMap = ({ members, onClose }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const addressCache = useRef({}); // Cache for geocoded addresses
  const { i18n } = useTranslation();
  const [mapError, setMapError] = useState(false);

  // Function to fetch address from Mapbox Geocoding API
  const getAddressFromCoordinates = async (lng, lat) => {
    const cacheKey = `${lat},${lng}`;

    // Check if address is already cached
    if (addressCache.current[cacheKey]) {
      return addressCache.current[cacheKey];
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`,
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        // Cache the address
        addressCache.current[cacheKey] = address;
        return address;
      }
      return "Address not available";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Address not available";
    }
  };

  // Format time to local timezone
  const formatLocationTime = (utcTime) => {
    if (!utcTime) return "N/A";
    return moment.utc(utcTime).local().format("MMM D, YYYY hh:mm:ss A");
  };

  // Generate dummy coordinates around a central location (e.g., center of USA)
  const generateDummyCoordinates = (index, total) => {
    const centerLat = 39.8283;
    const centerLng = -98.5795;
    const radius = 5; // degrees

    // Distribute markers in a circle
    const angle = (index / total) * 2 * Math.PI;
    const lat = centerLat + radius * Math.cos(angle);
    const lng = centerLng + radius * Math.sin(angle);

    return { lat, lng };
  };

  useEffect(() => {
    console.log("Map initialization useEffect triggered");
    console.log("mapContainer.current:", mapContainer.current);

    if (map.current) {
      console.log("Map already initialized, skipping");
      return; // Initialize map only once
    }

    if (!mapContainer.current) {
      console.log("Map container not ready yet");
      return;
    }

    console.log("Initializing map");

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-98.5795, 39.8283],
        zoom: 4,
        pitch: 0,
        bearing: 0,
        language: i18n.language?.split("-")[0] === "es" ? "es" : "en", // Set map label language
        antialias: true,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

      // Wait for map to load
      map.current.on("load", () => {
        // Map is ready
        console.log("Safety Network Map loaded");
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(true);
      Toast.error("Unable to load the map. Please refresh and try again.");
      // Close the map after showing error
      setTimeout(() => {
        onClose();
      }, 3000);
    }

    // Cleanup on unmount only
    return () => {
      if (map.current) {
        console.log("Cleaning up map");
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Separate useEffect to handle member markers
  useEffect(() => {
    if (!map.current) return;

    // Wait for map to load before adding markers
    const addMarkers = () => {
      // Remove existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add markers for members
      if (members && members.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();

        members.forEach((member, index) => {
          // Use real coordinates from API
          const lat = parseFloat(member.lat);
          const lng = parseFloat(member.long);

          // Skip if coordinates are invalid
          if (isNaN(lat) || isNaN(lng)) return;

          // Create marker element
          const el = document.createElement("div");
          el.className = "member-marker";
          el.style.width = "40px";
          el.style.height = "40px";
          el.style.borderRadius = "50%";
          el.style.backgroundColor = "#28a745";
          el.style.border = "3px solid white";
          el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.cursor = "pointer";
          el.style.fontSize = "18px";
          el.style.fontWeight = "700";
          el.style.color = "white";
          el.style.fontFamily = "'Decimal', sans-serif";
          el.textContent = (index + 1).toString();

          // Create popup with initial loading state
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
          }).setHTML(`
            <div style="padding: 12px; min-width: 200px; font-family: 'Decimal', sans-serif;">
              <div style="margin-bottom: 8px;">
                <div style="font-size: 16px; font-weight: 500; color: #212529; margin-bottom: 4px;">
                  ${member.name}
                </div>
                <div style="font-size: 12px; color: #6c757d;">
                  ${member.email}
                </div>
              </div>
              <div style="font-size: 12px; color: #495057; margin-bottom: 6px;">
                <strong>Location:</strong> Loading...
              </div>
              <div style="font-size: 12px; color: #495057;">
                <strong>Last Updated:</strong> ${formatLocationTime(
                  member.locationUpdatedTime,
                )}
              </div>
            </div>
          `);

          // Add marker to map
          const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current);

          markersRef.current.push(marker);

          // Add to bounds
          bounds.extend([lng, lat]);

          // Fetch address asynchronously and update popup
          getAddressFromCoordinates(lng, lat).then((address) => {
            popup.setHTML(`
              <div style="padding: 12px; min-width: 200px; font-family: 'Decimal', sans-serif;">
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 16px; font-weight: 500; color: #212529; margin-bottom: 4px;">
                    ${member.name}
                  </div>
                  <div style="font-size: 12px; color: #6c757d;">
                    ${member.email}
                  </div>
                </div>
                <div style="font-size: 12px; color: #495057; margin-bottom: 6px;">
                  <strong>Location:</strong> ${address}
                </div>
                <div style="font-size: 12px; color: #495057;">
                  <strong>Last Updated:</strong> ${formatLocationTime(
                    member.locationUpdatedTime,
                  )}
                </div>
              </div>
            `);
          });
        });

        // Fit map to show all markers
        if (members.length > 1) {
          map.current.fitBounds(bounds, { padding: 80 });
        } else if (members.length === 1) {
          // If only one member, center on them
          const lat = parseFloat(members[0].lat);
          const lng = parseFloat(members[0].long);
          if (!isNaN(lat) && !isNaN(lng)) {
            map.current.flyTo({
              center: [lng, lat],
              zoom: 10,
            });
          }
        }
      }
    };

    // Check if map is loaded
    if (map.current.isStyleLoaded()) {
      addMarkers();
    } else {
      map.current.once("load", addMarkers);
    }
  }, [members]);

  return (
    <MapContainer>
      <MapHeader>
        <h3>Safety Network Member Locations</h3>
        <CloseButton onClick={onClose}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </CloseButton>
      </MapHeader>
      {mapError ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "20px",
            textAlign: "center",
            color: "#dc3545",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          Unable to load the map. Please refresh and try again.
        </div>
      ) : (
        <MapWrapper ref={mapContainer} />
      )}
    </MapContainer>
  );
};

export default SafetyNetworkMap;
