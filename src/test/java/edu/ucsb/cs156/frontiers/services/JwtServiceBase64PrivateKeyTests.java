package edu.ucsb.cs156.frontiers.services;

import static org.mockito.Mockito.doReturn;

import edu.ucsb.cs156.frontiers.testconfig.DummyClock;
import edu.ucsb.cs156.frontiers.testconfig.TestConfig;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/** Verifies JwtService when app.private.key is stored as base64-encoded PEM (e.g. on Dokku). */
@RestClientTest(JwtService.class)
@Import({TestConfig.class})
@TestPropertySource(locations = "/testproperties-base64-private-key.properties")
public class JwtServiceBase64PrivateKeyTests {

  @Autowired private JwtService jwtService;

  @Value("${app.public.key:no-key-present}")
  private String publicKey;

  @MockitoBean private DateTimeProvider dateTimeProvider;

  private final Instant setInstant = Instant.parse("2024-05-23T08:00:00.00Z");

  @Test
  public void testGettingJwtWithBase64EncodedPrivateKeyProperty()
      throws NoSuchAlgorithmException, InvalidKeySpecException {
    doReturn(Optional.of(setInstant)).when(dateTimeProvider).getNow();
    String jwt = jwtService.getJwt();
    validateJwt(jwt, setInstant);
  }

  private void validateJwt(String compacted, Instant setInstant)
      throws InvalidKeySpecException, NoSuchAlgorithmException {
    String key = publicKey;
    key = key.replace("-----BEGIN PUBLIC KEY-----", "");
    key = key.replace("-----END PUBLIC KEY-----", "");
    key = key.replaceAll(" ", "");
    key = key.replaceAll(System.lineSeparator(), "");
    KeyFactory keyFactory = KeyFactory.getInstance("RSA");
    byte[] keyBytes = Base64.getDecoder().decode(key.getBytes());
    X509EncodedKeySpec x509EncodedKeySpec = new X509EncodedKeySpec(keyBytes);
    PublicKey secretKeySpec = keyFactory.generatePublic(x509EncodedKeySpec);
    JwtParser parser =
        Jwts.parser()
            .verifyWith(secretKeySpec)
            .clock(new DummyClock())
            .requireIssuer("testing-client-id")
            .requireIssuedAt(Date.from(setInstant.minus(30, ChronoUnit.SECONDS)))
            .requireExpiration(Date.from(setInstant.plus(5, ChronoUnit.MINUTES)))
            .build();
    parser.parse(compacted);
  }
}
