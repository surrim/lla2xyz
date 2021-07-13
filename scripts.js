const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const WGS84 = ellipsoidFromAF(6378137, 1 / 298.257223563); // see https://en.wikipedia.org/wiki/Earth_ellipsoid#Historical_Earth_ellipsoids

function ellipsoidFromAF(a, f) {
	return {
		a: a,
		b: a * (1 - f),
		f: f,
		esq: (2 - f) * f
	};
}

function n(ellipsoid, latitude) {
	const sinLatitude = Math.sin(latitude);
	return ellipsoid.a / Math.sqrt(1 - ellipsoid.esq * sinLatitude * sinLatitude);
}

function toXyz(ellipsoid, latitude, longitude, altitude) {
	const cosLatitude = Math.cos(latitude);
	const sinLatitude = Math.sin(latitude);
	const cosLongitude = Math.cos(longitude);
	const sinLongitude = Math.sin(longitude);

	const nLatitude = n(ellipsoid, latitude);
	const x = (nLatitude + altitude) * cosLatitude * cosLongitude;
	const y = (nLatitude + altitude) * cosLatitude * sinLongitude;
	const z = ((ellipsoid.b * ellipsoid.b) / (ellipsoid.a * ellipsoid.a) * nLatitude + altitude) * sinLatitude;
	return [x, y, z];
}

function toLla(ellipsoid, x, y, z) {
	const r = Math.hypot(x, y);
	const efsq = (ellipsoid.a - ellipsoid.b) * (ellipsoid.a + ellipsoid.b) / (ellipsoid.b * ellipsoid.b);
	const f = 54 * ellipsoid.b * ellipsoid.b * z * z;
	const g = (r * r) + (1 - ellipsoid.esq) * z * z - ellipsoid.esq * (ellipsoid.a * ellipsoid.a - ellipsoid.b * ellipsoid.b);
	const c = ellipsoid.esq * ellipsoid.esq * f * (r * r) / (g * g * g);
	const s = Math.cbrt(1 + c + Math.sqrt(c * (c + 2)));
	const p = f / (3 * ((s + 1 + 1 / s) * (s + 1 + 1 / s)) * g * g);
	const q = Math.sqrt(1 + 2 * ellipsoid.esq * ellipsoid.esq * p);
	const r0 = -p * ellipsoid.esq * r / (1 + q) + Math.sqrt(
			0.5 * ellipsoid.a * ellipsoid.a * (1 + 1 / q)
			- p * (1 - ellipsoid.esq) * z * z / (q * (1 + q))
			- 0.5 * p * r * r
	);
	const u = Math.hypot(r - ellipsoid.esq * r0, z);
	const v = Math.sqrt(((r - ellipsoid.esq * r0) * (r - ellipsoid.esq * r0)) + (1 - ellipsoid.esq) * z * z);
	const z0 = ellipsoid.b * ellipsoid.b * z / (ellipsoid.a * v);
	const altitude = u * (1 - ellipsoid.b * ellipsoid.b / (ellipsoid.a * v));
	const latitude = Math.atan2(z + efsq * z0, r);
	const longitude = Math.atan2(y, x);
	return [latitude, longitude, altitude];
}

function do_toXyz() {
	const latitude = Number(document.getElementById("latitude").value) * D2R;
	const longitude = Number(document.getElementById("longitude").value) * D2R;
	const altitude = Number(document.getElementById("altitude").value);
	const [x, y, z] = toXyz(WGS84, latitude, longitude, altitude);

	document.getElementById("x").value = x;
	document.getElementById("y").value = y;
	document.getElementById("z").value = z;
}

function do_toLla() {
	const x = Number(document.getElementById("x").value);
	const y = Number(document.getElementById("y").value);
	const z = Number(document.getElementById("z").value);
	const [latitude, longitude, altitude] = toLla(WGS84, x, y, z);

	document.getElementById("latitude").value = latitude * R2D;
	document.getElementById("longitude").value = longitude * R2D;
	document.getElementById("altitude").value = altitude;
}

