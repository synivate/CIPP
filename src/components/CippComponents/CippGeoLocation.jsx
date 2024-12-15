import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import dynamic from "next/dynamic";
import { ApiPostCall } from "/src/api/ApiCall";
import { CippPropertyList } from "./CippPropertyList";
import { getCippTranslation } from "../../utils/get-cipp-translation";
import { getCippFormatting } from "../../utils/get-cipp-formatting";
const CippMap = dynamic(() => import("./CippMap"), { ssr: false });

export default function CippGeoLocation({ ipAddress, cardProps }) {
  const [locationInfo, setLocationInfo] = useState(null);
  const [properties, setProperties] = useState([]);

  const includeProperties = ["timezone", "as", "proxy", "hosting", "mobile"];
  const markerProperties = ["org", "city", "region", "country", "zip"];

  const [markerPopupContents, setMarkerPopupContents] = useState(null);

  const geoLookup = ApiPostCall({
    urlFromData: true,
    queryKey: "GeoIPLookup-" + ipAddress,
    onResult: (result) => {
      setLocationInfo(result);
      var propertyList = [];
      includeProperties.map((key) => {
        propertyList.push({
          label: getCippTranslation(key),
          value: getCippFormatting(result[key], key),
        });
      });
      setProperties(propertyList);

      setMarkerPopupContents(
        <div>
          {markerProperties.map((key) => (
            <div key={key}>
              <strong>{getCippTranslation(key)}:</strong>{" "}
              {getCippFormatting(locationInfo[key], key)}
            </div>
          ))}
        </div>
      );
    },
  });

  useEffect(() => {
    if (ipAddress) {
      geoLookup.mutate({
        url: "/api/ExecGeoIPLookup",
        data: {
          IP: ipAddress,
        },
      });
    }
  }, [ipAddress]);

  return (
    <Card {...cardProps}>
      <CardHeader title={`Location Info for ${ipAddress}`} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={10}>
            {locationInfo && locationInfo.lat && locationInfo.lon && (
              <CippMap
                position={[locationInfo.lat, locationInfo.lon]}
                zoom={13}
                markerPopupContents={markerPopupContents}
                mapSx={{ height: "400px", width: "100%" }}
              />
            )}
          </Grid>
          <Grid item xs={2}>
            <CippPropertyList propertyItems={properties} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}