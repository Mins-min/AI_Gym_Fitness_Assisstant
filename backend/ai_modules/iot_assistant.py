import paho.mqtt.client as mqtt

MQTT_BROKER = "mqtt.eclipseprojects.io"  # Placeholder public broker
MQTT_PORT = 1883

def publish_iot_command(device_id: str, intensity: int) -> bool:
    """Publishes MQTT commands to IoT-enabled gym equipment[cite: 1]."""
    try:
        client = mqtt.Client()
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        topic = f"gym/equipment/{device_id}/control"
        payload = f'{{"intensity": {intensity}}}'
        
        client.publish(topic, payload)
        client.disconnect()
        return True
    except Exception as e:
        print(f"MQTT Error: {e}")
        return False 